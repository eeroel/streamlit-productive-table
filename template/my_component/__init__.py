import pandas as pd

import streamlit as st
import streamlit.components.v1 as components
import re

@st.cache
def read_data():
    df = pd.read_csv(
        "airports.dat",
        header=None,
        index_col=None
    )
    df.columns = [
        "airport_id", #Airport ID 	Unique OpenFlights identifier for this airport.
        "name", #Name 	Name of airport. May or may not contain the City name.
        "city", #City 	Main city served by airport. May be spelled differently from Name.
        "country", #Country 	Country or territory where airport is located. See Countries to cross-reference to ISO 3166-1 codes.
        "iata", #IATA 	3-letter IATA code. Null if not assigned/unknown.
        "icao", # 	4-letter ICAO code.
        "latitude", # 	Decimal degrees, usually to six significant digits. Negative is South, positive is North.
        "longitude",# 	Decimal degrees, usually to six significant digits. Negative is West, positive is East.
        "altitude",# 	In feet.
        "timezone",# 	Hours offset from UTC. Fractional hours are expressed as decimals, eg. India is 5.5.
        "dst",# 	Daylight savings time. One of E (Europe), A (US/Canada), S (South America), O (Australia), Z (New Zealand), N (None) or U (Unknown). See also: Help: Time
        "tz",# database time zone 	Timezone in "tz" (Olson) format, eg. "America/Los_Angeles".
        "type",# 	Type of the airport. Value "airport" for air terminals, "station" for train stations, "port" for ferry terminals and "unknown" if not known. In airports.csv, only type=airport is included.
        "source",
    ]
    return df

def _productive_table(data: pd.DataFrame, show_index):
    style=(
        data
        .style
        .set_table_styles(
            [{'selector': 'th:hover',
            'props': [('background-color', '#aaf')]}]
        )
    )
    if not show_index:
        style=style.hide_index()
    
    rendered = style.render()
    table = re.sub(
        r'(class="col_heading)(\s\w+\s)col([0-9]+)',
        r'onclick="sortTable(\3)" \1\2col\3',
        rendered
    )

    sort_fun = """
        <script>
        function sortTable(n) {
            var table, rows, values, indexed, indices_orig, indices, parent = 0;
            table = document.getElementsByTagName("table")[0];
            rows = table.rows;

            // 1. get the sorted indices of the column
            rowArray = Array.from(rows)
            rowArray.shift() // this should get rid of the first element (header)

            // treat values as numbers if they can be converted to numbers.
            // NOTE: this check would make more sense on the column level:
            // e.g. an ID string could have values 112 and ABC => 
            // lexicographic order would make more sense
            values = rowArray.map( (e,i) => { 
                    const val = e.getElementsByTagName("TD")[n].innerHTML;
                    return Number(val) ? Number(val):val.toLowerCase()
                })

            indexed = values.map( (e,i) => { return {ind: i, val: e} });
            indices_orig = indexed.map( e => { return e.ind });
            // in-place sort
            indexed.sort( (x,y) => { return x.val > y.val ? 1 : x.val == y.val ? 0 : -1 });
            indices = indexed.map( e => { return e.ind });

            // if already sorted, reverse
            if (indices_orig.every( (e,i) => { return e === indices[i] })) {
                indices.reverse();
            }

            // 2. reorder the table using the sorted indices
            indices.map( (e,i) => { rowArray[e].parentNode.appendChild(rowArray[e]) });
        }

        </script>
    """
    out = table + sort_fun
    return out

def productive_table(data, show_index=True, width=750, height=1000):
    return components.html(_productive_table(data=data, show_index=show_index), width=width, height=height, scrolling=True)

df = read_data().head(50)
rows = productive_table(df, show_index=False)
#st.dataframe(df)

