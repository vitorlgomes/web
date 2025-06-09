'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import supabaseClient from './supabaseClient'

export default function withAuth(Component) {
  return function withAuth(props) {
    const [user, setUser] = React.useState(undefined)

    const router = useRouter()
    useEffect(() => {
      async function redirectIfNotLoggedIn() {
        const { data } = await supabaseClient?.auth.getSession()
        const userData = data?.session?.user
        const auth = !!userData

        if (!auth) {
          return router.push('/auth')
        }

        setUser(userData)

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${data.session.user.email}?subdomain=${window.location.hostname}`,
        ).catch((error) => {
          console.error('Error fetching user validation:', error)
          
          return null
        })

        const validationObject = await response?.data

        const isUserValid = validationObject?.isValid

        if (!isUserValid) return router.push('/?redirectReason=405')

        return data?.session?.user
      }

      redirectIfNotLoggedIn()
    }, [])

    return <Component shopId={user?.user_metadata?.shopId} {...props} />
  }
}
