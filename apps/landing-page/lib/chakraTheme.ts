import { extendTheme } from '@chakra-ui/react'

const config = { initialColorMode: 'dark', useSystemColorMode: false }

const fonts = {
  heading: 'Outfit',
  body: 'Open Sans',
}

const colors = {
  blue: {
    50: '#e0edff',
    100: '#b0caff',
    200: '#7ea6ff',
    300: '#4b83ff',
    400: '#1a5fff',
    500: '#0042da',
    600: '#0036b4',
    700: '#002782',
    800: '#001751',
    900: '#1a202c',
  },
  red: {
    50: '#fff5f5',
    100: '#fed7d7',
    200: '#feb2b2',
    300: '#fc8181',
    400: '#f56565',
    500: '#e53e3e',
    600: '#c53030',
    700: '#9b2c2c',
    800: '#822727',
    900: '#63171b',
  },
  orange: {
    50: '#fff1da',
    100: '#ffd7ae',
    200: '#ffbf7d',
    300: '#ffa54c',
    400: '#ff8b1a',
    500: '#e67200',
    600: '#b45800',
    700: '#813e00',
    800: '#4f2500',
    900: '#200b00',
  },
  yellow: {
    50: '#fff9da',
    100: '#ffedad',
    200: '#ffe17d',
    300: '#ffd54b',
    400: '#ffc91a',
    500: '#e6b000',
    600: '#b38800',
    700: '#806200',
    800: '#4e3a00',
    900: '#1d1400',
  },
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'red',
    },
    variants: {
      solid: () => ({
        bg: 'red.400',
        color: 'white',
        shadow: 'inset 0 1px 0 0 rgb(255 255 255/.2)',
        _hover: {
          bg: 'red.300',
        },
      }),
    },
  },
  NumberInput: {
    defaultProps: {
      focusBorderColor: 'red.200',
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'red.200',
    },
  },
  Popover: {
    baseStyle: {
      popper: {
        width: 'fit-content',
        maxWidth: 'fit-content',
      },
    },
  },
  Tooltip: {
    baseStyle: {
      borderRadius: 'md',
    },
  },
  Link: {
    baseStyle: {
      _hover: { textDecoration: 'none' },
    },
  },
}

export const theme = extendTheme({
  fonts,
  components,
  colors,
  config,
})
