import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Store = {
    email: string
    setEmail: (newEmail: string) => void
    token: string
    setToken: (newToken: string) => void
    firstName: string
    setFirstName: (name: string) => void
    lastName: string
    setLastName: (name: string) => void

    clearAuthStorage: () => void

}

export const useStore = create<Store>()(
    persist(
        (set) => ({
            email: '',
            setEmail: (newEmail) => set({ email: newEmail }),

            token: '',
            setToken: (newToken) => set({ token: newToken }),

            firstName: '',
            setFirstName: (newFirstName) => set({ firstName: newFirstName }),

            lastName: '',
            setLastName: (newLastName) => set({ lastName: newLastName }),

            clearAuthStorage: () => {
                set({
                    email: '',
                    token: '',
                    firstName: '',
                    lastName: ''
                })

                //Clear persisted storage
                useStore.persist.clearStorage()
            }
        }),
        {
            name: 'soundwell-admin-auth'
        }
    )
);