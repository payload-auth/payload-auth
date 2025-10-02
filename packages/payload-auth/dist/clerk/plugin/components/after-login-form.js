'use client';
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadClerkInstance } from "../../utils/load-clerk-instance";
export function AfterLoginForm({ redirectOnLoginTo }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccessful, setLoginSuccessful] = useState(false);
    useEffect(()=>{
        loadClerkInstance().catch((err)=>console.error('Error loading clerk:', err));
    }, []);
    useEffect(()=>{
        const form = document.querySelector('form.login__form');
        if (!form) return;
        const onSubmit = async (event)=>{
            event.preventDefault();
            setIsLoading(true);
            try {
                const emailInput = form.querySelector('input[name="email"]');
                if (!emailInput) throw new Error('Email input not found');
                const passwordInput = form.querySelector('input[name="password"]');
                if (!passwordInput) throw new Error('Password input not found');
                const email = emailInput.value;
                if (!email) throw new Error('Email is required');
                const password = passwordInput.value;
                if (!password) throw new Error('Password is required');
                const clerk = await loadClerkInstance();
                if (!clerk) return;
                const signInAttempt = await clerk.client?.signIn.create({
                    identifier: email,
                    password,
                    strategy: 'password'
                });
                if (signInAttempt?.status !== 'complete') {
                    console.error(JSON.stringify(signInAttempt, null, 2));
                    return;
                }
                setLoginSuccessful(true);
                document.querySelector('.payload-toast-item')?.remove();
                await clerk.setActive({
                    session: signInAttempt.createdSessionId
                });
                router.push(redirectOnLoginTo ?? '/admin');
            } catch (error) {
                console.log('Error logging in:', error);
            } finally{
                setIsLoading(false);
            }
        };
        form.addEventListener('submit', onSubmit);
        return ()=>form.removeEventListener('submit', onSubmit);
    }, []);
    return /*#__PURE__*/ _jsx(_Fragment, {
        children: /*#__PURE__*/ _jsx("style", {
            children: `
        .payload-toast-item {
          opacity: ${isLoading || loginSuccessful ? '0' : '1'} !important;
        }
      `
        })
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29tcG9uZW50cy9hZnRlci1sb2dpbi1mb3JtLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCdcblxuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9uYXZpZ2F0aW9uJ1xuaW1wb3J0IHsgbG9hZENsZXJrSW5zdGFuY2UgfSBmcm9tICcuLi8uLi91dGlscy9sb2FkLWNsZXJrLWluc3RhbmNlJ1xuXG5leHBvcnQgZnVuY3Rpb24gQWZ0ZXJMb2dpbkZvcm0oeyByZWRpcmVjdE9uTG9naW5UbyB9OiB7IHJlZGlyZWN0T25Mb2dpblRvOiBzdHJpbmcgfSkge1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKVxuICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtsb2dpblN1Y2Nlc3NmdWwsIHNldExvZ2luU3VjY2Vzc2Z1bF0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxvYWRDbGVya0luc3RhbmNlKCkuY2F0Y2goKGVycjogYW55KSA9PiBjb25zb2xlLmVycm9yKCdFcnJvciBsb2FkaW5nIGNsZXJrOicsIGVycikpXG4gIH0sIFtdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0ubG9naW5fX2Zvcm0nKVxuICAgIGlmICghZm9ybSkgcmV0dXJuXG5cbiAgICBjb25zdCBvblN1Ym1pdCA9IGFzeW5jIChldmVudDogYW55KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBzZXRJc0xvYWRpbmcodHJ1ZSlcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImVtYWlsXCJdJykgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICAgICBpZiAoIWVtYWlsSW5wdXQpIHRocm93IG5ldyBFcnJvcignRW1haWwgaW5wdXQgbm90IGZvdW5kJylcblxuICAgICAgICBjb25zdCBwYXNzd29yZElucHV0ID0gZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicGFzc3dvcmRcIl0nKSBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgICAgIGlmICghcGFzc3dvcmRJbnB1dCkgdGhyb3cgbmV3IEVycm9yKCdQYXNzd29yZCBpbnB1dCBub3QgZm91bmQnKVxuXG4gICAgICAgIGNvbnN0IGVtYWlsID0gZW1haWxJbnB1dC52YWx1ZVxuICAgICAgICBpZiAoIWVtYWlsKSB0aHJvdyBuZXcgRXJyb3IoJ0VtYWlsIGlzIHJlcXVpcmVkJylcblxuICAgICAgICBjb25zdCBwYXNzd29yZCA9IHBhc3N3b3JkSW5wdXQudmFsdWVcbiAgICAgICAgaWYgKCFwYXNzd29yZCkgdGhyb3cgbmV3IEVycm9yKCdQYXNzd29yZCBpcyByZXF1aXJlZCcpXG5cbiAgICAgICAgY29uc3QgY2xlcmsgPSBhd2FpdCBsb2FkQ2xlcmtJbnN0YW5jZSgpXG4gICAgICAgIGlmICghY2xlcmspIHJldHVyblxuICAgICAgICBjb25zdCBzaWduSW5BdHRlbXB0ID0gYXdhaXQgY2xlcmsuY2xpZW50Py5zaWduSW4uY3JlYXRlKHtcbiAgICAgICAgICBpZGVudGlmaWVyOiBlbWFpbCxcbiAgICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgICBzdHJhdGVneTogJ3Bhc3N3b3JkJ1xuICAgICAgICB9KVxuXG4gICAgICAgIGlmIChzaWduSW5BdHRlbXB0Py5zdGF0dXMgIT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKEpTT04uc3RyaW5naWZ5KHNpZ25JbkF0dGVtcHQsIG51bGwsIDIpKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgc2V0TG9naW5TdWNjZXNzZnVsKHRydWUpXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXlsb2FkLXRvYXN0LWl0ZW0nKT8ucmVtb3ZlKClcbiAgICAgICAgYXdhaXQgY2xlcmsuc2V0QWN0aXZlKHsgc2Vzc2lvbjogc2lnbkluQXR0ZW1wdC5jcmVhdGVkU2Vzc2lvbklkIH0pXG4gICAgICAgIHJvdXRlci5wdXNoKHJlZGlyZWN0T25Mb2dpblRvID8/ICcvYWRtaW4nKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIGxvZ2dpbmcgaW46JywgZXJyb3IpXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBvblN1Ym1pdClcbiAgICByZXR1cm4gKCkgPT4gZm9ybS5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBvblN1Ym1pdClcbiAgfSwgW10pXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPHN0eWxlPntgXG4gICAgICAgIC5wYXlsb2FkLXRvYXN0LWl0ZW0ge1xuICAgICAgICAgIG9wYWNpdHk6ICR7aXNMb2FkaW5nIHx8IGxvZ2luU3VjY2Vzc2Z1bCA/ICcwJyA6ICcxJ30gIWltcG9ydGFudDtcbiAgICAgICAgfVxuICAgICAgYH08L3N0eWxlPlxuICAgIDwvPlxuICApXG59XG4iXSwibmFtZXMiOlsidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJ1c2VSb3V0ZXIiLCJsb2FkQ2xlcmtJbnN0YW5jZSIsIkFmdGVyTG9naW5Gb3JtIiwicmVkaXJlY3RPbkxvZ2luVG8iLCJyb3V0ZXIiLCJpc0xvYWRpbmciLCJzZXRJc0xvYWRpbmciLCJsb2dpblN1Y2Nlc3NmdWwiLCJzZXRMb2dpblN1Y2Nlc3NmdWwiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImZvcm0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJvblN1Ym1pdCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJlbWFpbElucHV0IiwiRXJyb3IiLCJwYXNzd29yZElucHV0IiwiZW1haWwiLCJ2YWx1ZSIsInBhc3N3b3JkIiwiY2xlcmsiLCJzaWduSW5BdHRlbXB0IiwiY2xpZW50Iiwic2lnbkluIiwiY3JlYXRlIiwiaWRlbnRpZmllciIsInN0cmF0ZWd5Iiwic3RhdHVzIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlbW92ZSIsInNldEFjdGl2ZSIsInNlc3Npb24iLCJjcmVhdGVkU2Vzc2lvbklkIiwicHVzaCIsImxvZyIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic3R5bGUiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFNBQVNBLFNBQVMsRUFBRUMsUUFBUSxRQUFRLFFBQU87QUFDM0MsU0FBU0MsU0FBUyxRQUFRLGtCQUFpQjtBQUMzQyxTQUFTQyxpQkFBaUIsUUFBUSxrQ0FBaUM7QUFFbkUsT0FBTyxTQUFTQyxlQUFlLEVBQUVDLGlCQUFpQixFQUFpQztJQUNqRixNQUFNQyxTQUFTSjtJQUNmLE1BQU0sQ0FBQ0ssV0FBV0MsYUFBYSxHQUFHUCxTQUFTO0lBQzNDLE1BQU0sQ0FBQ1EsaUJBQWlCQyxtQkFBbUIsR0FBR1QsU0FBUztJQUV2REQsVUFBVTtRQUNSRyxvQkFBb0JRLEtBQUssQ0FBQyxDQUFDQyxNQUFhQyxRQUFRQyxLQUFLLENBQUMsd0JBQXdCRjtJQUNoRixHQUFHLEVBQUU7SUFFTFosVUFBVTtRQUNSLE1BQU1lLE9BQU9DLFNBQVNDLGFBQWEsQ0FBQztRQUNwQyxJQUFJLENBQUNGLE1BQU07UUFFWCxNQUFNRyxXQUFXLE9BQU9DO1lBQ3RCQSxNQUFNQyxjQUFjO1lBQ3BCWixhQUFhO1lBRWIsSUFBSTtnQkFDRixNQUFNYSxhQUFhTixLQUFLRSxhQUFhLENBQUM7Z0JBQ3RDLElBQUksQ0FBQ0ksWUFBWSxNQUFNLElBQUlDLE1BQU07Z0JBRWpDLE1BQU1DLGdCQUFnQlIsS0FBS0UsYUFBYSxDQUFDO2dCQUN6QyxJQUFJLENBQUNNLGVBQWUsTUFBTSxJQUFJRCxNQUFNO2dCQUVwQyxNQUFNRSxRQUFRSCxXQUFXSSxLQUFLO2dCQUM5QixJQUFJLENBQUNELE9BQU8sTUFBTSxJQUFJRixNQUFNO2dCQUU1QixNQUFNSSxXQUFXSCxjQUFjRSxLQUFLO2dCQUNwQyxJQUFJLENBQUNDLFVBQVUsTUFBTSxJQUFJSixNQUFNO2dCQUUvQixNQUFNSyxRQUFRLE1BQU14QjtnQkFDcEIsSUFBSSxDQUFDd0IsT0FBTztnQkFDWixNQUFNQyxnQkFBZ0IsTUFBTUQsTUFBTUUsTUFBTSxFQUFFQyxPQUFPQyxPQUFPO29CQUN0REMsWUFBWVI7b0JBQ1pFO29CQUNBTyxVQUFVO2dCQUNaO2dCQUVBLElBQUlMLGVBQWVNLFdBQVcsWUFBWTtvQkFDeENyQixRQUFRQyxLQUFLLENBQUNxQixLQUFLQyxTQUFTLENBQUNSLGVBQWUsTUFBTTtvQkFDbEQ7Z0JBQ0Y7Z0JBRUFsQixtQkFBbUI7Z0JBQ25CTSxTQUFTQyxhQUFhLENBQUMsd0JBQXdCb0I7Z0JBQy9DLE1BQU1WLE1BQU1XLFNBQVMsQ0FBQztvQkFBRUMsU0FBU1gsY0FBY1ksZ0JBQWdCO2dCQUFDO2dCQUNoRWxDLE9BQU9tQyxJQUFJLENBQUNwQyxxQkFBcUI7WUFDbkMsRUFBRSxPQUFPUyxPQUFPO2dCQUNkRCxRQUFRNkIsR0FBRyxDQUFDLHFCQUFxQjVCO1lBQ25DLFNBQVU7Z0JBQ1JOLGFBQWE7WUFDZjtRQUNGO1FBRUFPLEtBQUs0QixnQkFBZ0IsQ0FBQyxVQUFVekI7UUFDaEMsT0FBTyxJQUFNSCxLQUFLNkIsbUJBQW1CLENBQUMsVUFBVTFCO0lBQ2xELEdBQUcsRUFBRTtJQUVMLHFCQUNFO2tCQUNFLGNBQUEsS0FBQzJCO3NCQUFPLENBQUM7O21CQUVJLEVBQUV0QyxhQUFhRSxrQkFBa0IsTUFBTSxJQUFJOztNQUV4RCxDQUFDOzs7QUFHUCJ9