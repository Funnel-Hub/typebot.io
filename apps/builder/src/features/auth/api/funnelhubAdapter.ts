import type { Adapter, AdapterUser } from 'next-auth/adapters'

export const funnelhubAdapter = (): Adapter => {
  return {
    createUser: async (data: Omit<AdapterUser, 'id'>) => {
      console.log(data)
      throw Error('method not implemented.')
    },
    getUser: async (id) => {
      console.log(id)
      throw Error('method not implemented.')
    },
    getUserByEmail: async (email) => {
      console.log(email)
      throw Error('method not implemented.')
    },
    async getUserByAccount(provider_providerAccountId) {
      console.log(provider_providerAccountId)
      throw Error('method not implemented.')
    },
    updateUser: async (data) => {
      console.log(data)
      throw Error('method not implemented.')
    },
    deleteUser: async (id) => {
      console.log(id)
      throw Error('method not implemented.')
    },
    linkAccount: async (data) => {
      console.log(data)
      throw Error('method not implemented.')
    },
    unlinkAccount: async (provider_providerAccountId) => {
      console.log(provider_providerAccountId)
      throw Error('method not implemented.')
    },
    async getSessionAndUser(sessionToken) {
      console.log(sessionToken)
      throw Error('method not implemented.')
    },
    createSession: (data) => {
      console.log(data)
      throw Error('method not implemented.')
    },
    updateSession: (data) => {
      console.log(data)
      throw Error('method not implemented.')
    },
    deleteSession: (sessionToken) => {
      console.log(sessionToken)
      throw Error('method not implemented.')
    },
    async useVerificationToken(identifier_token) {
      console.log(identifier_token)
      throw Error('method not implemented.')
    },
  }
}
