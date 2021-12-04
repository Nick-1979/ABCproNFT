import { create } from "jss";
import { adaptV4Theme } from "@mui/material/styles";
import rtl from "jss-rtl";
import { createTheme } from "@mui/material/styles";


import rtlPlugin from 'stylis-plugin-rtl';
// import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';


import { jssPreset } from "@mui/styles";
import { faIR } from "@mui/material/locale";



// Create rtl cache
export const cacheRtl = createCache({
  key: 'muirtl',
  // stylisPlugins: [rtlPlugin],
  stylisPlugins: [],
});

// export const rtlJss = create({ plugins: [...jssPreset().plugins, rtl()] });

export const rtlJss = create({ plugins: [...jssPreset().plugins] });

export const rtlTheme = createTheme(
  {
    direction:'ltr',// "rtl",
    typography: {
      fontFamily: [
        "IranSans",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
      fontSize: 11,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
    },
    palette: {
      primary: { main: "#1976d2" },
    },
    marginTop: '50px'
  },
  // faIR
);
