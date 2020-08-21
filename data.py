"""
Retrieves data from United Nations Humanitarian Data Exchange Platform
Formats data into JSON files usable by js scripts
"""

import pandas as pd
import json
from datetime import datetime
import os
from urllib.request import urlretrieve


########## metadata processing ##########
def get_metadata_dict(filename='metadata.csv'):
    df = pd.read_csv(filename, encoding='utf-8')
    country_lst, alias_lst, chinese_lst, population_lst = df['Country/Region'], df['Alias'], df['Chinese'], df['Population']

    alias = {country_lst[i]: alias_lst[i] for i in range(len(df))}
    chinese = {country_lst[i]: chinese_lst[i] for i in range(len(df))}

    population = {}
    for i in range(len(population_lst)):
        pop = population_lst[i]
        for key in [alias_lst[i], chinese_lst[i]]:
            if pop.endswith('m'):
                population[key] = float(pop[:-1]) * 1000000
            elif pop.endswith('b'):
                population[key] = float(pop[:-1]) * 1000000000
            else:
                population[key] = float(pop)

    return alias, chinese, population


########## helper functions ##########

# determines if a column represents a date
# uses the observation that from the original csv, all date columns end with '20'
def is_date(col):
    return col.endswith('20')


# converts a date column title to a standard format (for example, '2020-04-01')
def process_date_str(col):
    if is_date(col):
        if col.startswith('20'):
            month, day = col.split('-')[0][2:], col.split('-')[1]
        else:
            month, day = col.split('/')[0], col.split('/')[1]
        return str(datetime(2020, int(month), int(day)))[:10]
    else:
        return col


# combine province and country into a single attribute (region)
def combine_country_province(province, country):
    if isinstance(province, str) and len(province) > 0:
        return country + '.' + province
    else:
        return country


def smooth_series(data, halfWindow=3):
    """
        Smooths a data series using unweighted rolling average
        Rolling window defaults to 7 days
        :param data: a list-like object
        :param halfWindow: length (number of days) of one side of the rolling window
        """
    smooths = []
    for i, n in enumerate(data):
        leftIndex = max(0, i-halfWindow)
        rightIndex = min(len(data), i + halfWindow+1)
        smoothed = sum(data[leftIndex: rightIndex]) / (rightIndex - leftIndex)
        smooths.append(int(smoothed))
    return smooths


########## Preprocessing ##########

# returns a preprocessed dataframe
def df_preprocess(df):
    dates = sorted(process_date_str(col) for col in df.columns if is_date(col))
    regions_count = {}
    for i in df.index:
        row = list(df.iloc[i])
        regions_count[combine_country_province(row[0], row[1])] = row[4:]
        # aggregate by country
        if isinstance(row[0], str) and len(row[0]) > 0:
            country = row[1]
            if country in regions_count:
                regions_count[country] = [regions_count[country][i] + row[4:][i] for i in range(len(df.columns) - 4)]
            else:
                regions_count[country] = row[4:]

    new_df = pd.DataFrame()
    new_df['date'] = dates
    for region, data in regions_count.items():
        new_df[region] = data

    countries = [col for col in new_df.columns if (not '.' in col) and col != 'date']
    total = new_df[countries[0]].tolist()
    for country in countries[1:]:
        total += new_df[country]
    new_df['World'] = total


    return new_df


def df_preprocess_from_file(filename):
    df = pd.read_csv('data/{}.csv'.format(filename))
    df = df_preprocess(df)
    return df


def df_daily_increase(df):
    def get_increase(lst):
        change = [lst[i + 1] - lst[i] for i in range(len(lst) - 1)]
        return [max(0, c) for c in change]

    dates = df['date']
    new_df = pd.DataFrame({'date': dates[1:]})
    for col in df.columns:
        if col != 'date':
            daily_increase = get_increase(df[col].tolist())
            new_df[col] = daily_increase

    return new_df


def get_active_cases(confirmed, recovered, deaths):
    if not (confirmed['date'] == recovered['date']).all() \
            and (deaths['date'] == recovered['date']).all()\
            and (confirmed['date'] == deaths['date']).all():
        print('get_active_cases: the dataframes do not have identical date series.')
        raise Exception
    active = pd.DataFrame({'date': confirmed['date']})

    regions = set(r for r in confirmed.columns if r != 'date')
    regions = regions.intersection(recovered.columns).intersection(deaths.columns)
    for region in regions:
        active[region] = confirmed[region] - recovered[region] - deaths[region]

    return active


########## Formatting and outputting JSON files ##########

# returns a dict object with the following format
# { date:[date1, date2,],
#   latest: [(country1, count1), (country2, count2),]
#   world: {total: [count1, count2,]},
#   country1: {total:[count1, count2,], latest:[(province1, count1), (province2, count2)],
#               province1:[count1, count2,], province2:[count1, count2],}}
def df_to_dict(df, to_chinese=False, rate_base = 1000):
    ret = {'date': df['date'].tolist(), 'latest': []}
    ret['date'] = df['date'].tolist()

    # add data to the dictionary, one region at a time
    for col in df.columns:
        if col == 'date' or (col in alias and 'Cruise' in alias[col]):
            continue
        region_data = df[col].tolist()
        if '.' in col:  # a provincial region
            country, province = col.split('.')
            if to_chinese:
                country = chinese[country]
            else:
                country=alias[country]

            if country in ret:
                ret[country][province] = region_data
                ret[country]['latest'].append((province, region_data[-1]))
            else:
                ret[country] = {'latest': [(province, region_data[-1])], province: region_data}
        else:
            country = col
            if to_chinese:
                country = chinese[country]
            else:
                country=alias[country]

            if country in ret:
                ret[country]['total'] = region_data
            else:
                ret[country] = {'total': region_data, 'latest': []}
            ret['latest'].append((country, region_data[-1]))

    # sort "latest" arrays by count
    ret['latest'] = sorted(ret['latest'], key=lambda t: t[1], reverse=True)
    ret['latest'] = {t[0]: t[1] for t in ret['latest']}

    ret['rate'] = {}
    for country, value in ret['latest'].items():
        if population[country] == 0:
            ret['rate'][country] = '0.000'
        else:
            rate = float(value/population[country] * rate_base)
            rate = '{:.2f}'.format(rate)
            ret['rate'][country] = rate

    for country in ret:
        if country not in ['date', 'latest', 'World','rate']:
            ret[country]['latest'] = sorted(ret[country]['latest'], key=lambda t: t[1], reverse=True)
            ret[country]['latest'] = {t[0]: t[1] for t in ret[country]['latest']}

    return ret


def getDataCollection(filenames, to_chinese=False):
    data = {}
    for file_name in filenames:
        print('Processing {}'.format(file_name))
        if file_name == 'active':
            confirmed, recovered, deaths = df_preprocess_from_file('confirmed'), \
                                           df_preprocess_from_file('recovered'), \
                                           df_preprocess_from_file('deaths')
            df = get_active_cases(confirmed, recovered, deaths)
            data[file_name] = df_to_dict(df, to_chinese)
        else:
            df = df_preprocess_from_file(file_name)
            daily_increase = df_daily_increase(df)
            if file_name == 'deaths':
                rate_base = 1000000
            else:
                rate_base = 1000
            data[file_name] = df_to_dict(df, to_chinese, rate_base)
            data[file_name + '_daily'] = df_to_dict(daily_increase, to_chinese)
    return data


def writeToJS(filenames, to_chinese=False):
    data = getDataCollection(filenames, to_chinese)
    jsonString = json.dumps(data)
    jsonString = 'const dataCollection = \n' + jsonString

    outfile = './data/data-collection.js'
    if to_chinese:
        outfile = './data/data-collection-cn.js'

    with open(outfile, 'w') as outfile:
        outfile.write(jsonString)


if __name__ == "__main__":
    if not os.path.exists('./data'):
        os.mkdir('./data')

    print('Retriveing data.')
    # data retrived from https://data.humdata.org/dataset/novel-coronavirus-2019-ncov-cases
    confirmed_url = 'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_confirmed_global.csv&filename=time_series_covid19_confirmed_global.csv'
    urlretrieve(confirmed_url, './data/confirmed.csv')

    deaths_url = 'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_deaths_global.csv&filename=time_series_covid19_deaths_global.csv'
    urlretrieve(deaths_url, './data/deaths.csv')

    recovered_url = 'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_recovered_global.csv&filename=time_series_covid19_recovered_global.csv'
    urlretrieve(recovered_url, './data/recovered.csv')


    alias, chinese, population = get_metadata_dict()

    writeToJS(['confirmed', 'deaths', 'recovered', 'active'])
    writeToJS(['confirmed', 'deaths', 'recovered', 'active'], True)

