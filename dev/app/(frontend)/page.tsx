import { Login } from './login.js'

export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center overflow-hidden no-visible-scrollbar px-6 md:px-0">
      <main className="flex flex-col gap-4 row-start-2 items-center justify-center">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-4xl text-black dark:text-white text-center">
            Better Auth.
          </h3>
          <p className="text-center break-words text-sm md:text-base">
            Official demo to showcase features and capabilities. <br />
          </p>
        </div>
        <div className="md:w-10/12 w-full flex flex-col gap-4">
          <div className="flex flex-col gap-3 pt-2 flex-wrap">
            <div className="border-y py-2 border-dotted bg-secondary/60 opacity-80">
              <div className="text-xs flex items-center gap-2 justify-center text-muted-foreground ">
                <span className="text-center">
                  All features on this demo are Implemented with better auth without any custom
                  backend code
                </span>
              </div>
            </div>
          </div>
          <Login />
        </div>
      </main>
    </div>
  )
}
