import pandas as pd

import streamlit as st
import streamlit.components.v1 as components

@st.cache
def read_data():
    df = pd.DataFrame({'foo': [1,2,3], 'bar': ['hey','what','up']})
    return df

_productive_table = components.declare_component(
    "productive_table", url="http://localhost:3001",
)


def productive_table(data, skip_first_col=False, key=None):
    return _productive_table(data=data, skip_first_col=skip_first_col, default=[], key=key)

df=read_data()
rows = productive_table(df, skip_first_col=True)
if rows:
    st.write("You have selected", rows)
