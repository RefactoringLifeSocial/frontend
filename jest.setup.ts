import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from "util"

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// TextEncoder y TextDecoder
global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Mock de import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: "http://localhost:3000/",
        MODE: "test",
        DEV: false,
        PROD: false,
        SSR: false,
      }
    }
  },
  writable: true,
})

// Mock alternativo para módulos que usan import.meta
import axios from 'axios'

jest.mock('@/services/axiosInstance', () => {
  return {
    __esModule: true,
    default: axios.create({
      baseURL: "http://localhost:3000/",
    })
  }
})