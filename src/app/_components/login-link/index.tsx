'use client'

import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { isValidToken } from './is-valid-token.api'

export function LoginLink() {
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    let ignore = false
    void (async () => {
      const isValid = await isValidToken()
      if (!ignore) {
        setIsValid(isValid)
      }
    })()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div>
      <Link
        href={isValid ? '/tasks' : '/login'}
        className="btn btn-ghost h-8 w-24 rounded text-base max-lg:hidden"
      >
        ログイン
      </Link>
      <Link href={isValid ? '/tasks' : '/login'} className="btn-icon lg:hidden">
        <ArrowRightEndOnRectangleIcon className="h-8 w-8" />
      </Link>
    </div>
  )
}
