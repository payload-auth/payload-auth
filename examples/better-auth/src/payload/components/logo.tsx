import React from 'react'

export default function Logo() {
  return (
    <div className="mb-8 flex w-full items-center justify-center">
      <svg width="60" height="45" viewBox="0 0 60 45" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0H15V15H30V30H15V45H0V30V15V0ZM45 30V15H30V0H45H60V15V30V45H45H30V30H45Z"
          className="fill-black dark:fill-white"
        />
      </svg>
      <div className="ml-2 font-semibold text-black dark:text-white">
        Payload <span className="text-blue-600 dark:text-blue-400">&times;</span> Better Auth
      </div>
    </div>
  )
}
