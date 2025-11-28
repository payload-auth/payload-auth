export const getSafeRedirect = (redirectParam, fallback = '/')=>{
    if (typeof redirectParam !== 'string') {
        return fallback;
    }
    // Normalize and decode the path
    let redirectPath;
    try {
        redirectPath = decodeURIComponent(redirectParam.trim());
    } catch  {
        return fallback // invalid encoding
        ;
    }
    const isSafeRedirect = // Must start with a single forward slash (e.g., "/admin")
    redirectPath.startsWith('/') && // Prevent protocol-relative URLs (e.g., "//example.com")
    !redirectPath.startsWith('//') && // Prevent encoded slashes that could resolve to protocol-relative
    !redirectPath.startsWith('/%2F') && // Prevent backslash-based escape attempts (e.g., "/\\/example.com", "/\\\\example.com", "/\\example.com")
    !redirectPath.startsWith('/\\/') && !redirectPath.startsWith('/\\\\') && !redirectPath.startsWith('/\\') && // Prevent javascript-based schemes (e.g., "/javascript:alert(1)")
    !redirectPath.toLowerCase().startsWith('/javascript:') && // Prevent attempts to redirect to full URLs using "/http:" or "/https:"
    !redirectPath.toLowerCase().startsWith('/http');
    return isSafeRedirect ? redirectPath : fallback;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC91dGlscy9nZXQtc2FmZS1yZWRpcmVjdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2V0U2FmZVJlZGlyZWN0ID0gKHJlZGlyZWN0UGFyYW06IHN0cmluZyB8IHN0cmluZ1tdLCBmYWxsYmFjazogc3RyaW5nID0gJy8nKTogc3RyaW5nID0+IHtcbiAgaWYgKHR5cGVvZiByZWRpcmVjdFBhcmFtICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxsYmFja1xuICB9XG5cbiAgLy8gTm9ybWFsaXplIGFuZCBkZWNvZGUgdGhlIHBhdGhcbiAgbGV0IHJlZGlyZWN0UGF0aDogc3RyaW5nXG4gIHRyeSB7XG4gICAgcmVkaXJlY3RQYXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0UGFyYW0udHJpbSgpKVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsbGJhY2sgLy8gaW52YWxpZCBlbmNvZGluZ1xuICB9XG5cbiAgY29uc3QgaXNTYWZlUmVkaXJlY3QgPVxuICAgIC8vIE11c3Qgc3RhcnQgd2l0aCBhIHNpbmdsZSBmb3J3YXJkIHNsYXNoIChlLmcuLCBcIi9hZG1pblwiKVxuICAgIHJlZGlyZWN0UGF0aC5zdGFydHNXaXRoKCcvJykgJiZcbiAgICAvLyBQcmV2ZW50IHByb3RvY29sLXJlbGF0aXZlIFVSTHMgKGUuZy4sIFwiLy9leGFtcGxlLmNvbVwiKVxuICAgICFyZWRpcmVjdFBhdGguc3RhcnRzV2l0aCgnLy8nKSAmJlxuICAgIC8vIFByZXZlbnQgZW5jb2RlZCBzbGFzaGVzIHRoYXQgY291bGQgcmVzb2x2ZSB0byBwcm90b2NvbC1yZWxhdGl2ZVxuICAgICFyZWRpcmVjdFBhdGguc3RhcnRzV2l0aCgnLyUyRicpICYmXG4gICAgLy8gUHJldmVudCBiYWNrc2xhc2gtYmFzZWQgZXNjYXBlIGF0dGVtcHRzIChlLmcuLCBcIi9cXFxcL2V4YW1wbGUuY29tXCIsIFwiL1xcXFxcXFxcZXhhbXBsZS5jb21cIiwgXCIvXFxcXGV4YW1wbGUuY29tXCIpXG4gICAgIXJlZGlyZWN0UGF0aC5zdGFydHNXaXRoKCcvXFxcXC8nKSAmJlxuICAgICFyZWRpcmVjdFBhdGguc3RhcnRzV2l0aCgnL1xcXFxcXFxcJykgJiZcbiAgICAhcmVkaXJlY3RQYXRoLnN0YXJ0c1dpdGgoJy9cXFxcJykgJiZcbiAgICAvLyBQcmV2ZW50IGphdmFzY3JpcHQtYmFzZWQgc2NoZW1lcyAoZS5nLiwgXCIvamF2YXNjcmlwdDphbGVydCgxKVwiKVxuICAgICFyZWRpcmVjdFBhdGgudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCcvamF2YXNjcmlwdDonKSAmJlxuICAgIC8vIFByZXZlbnQgYXR0ZW1wdHMgdG8gcmVkaXJlY3QgdG8gZnVsbCBVUkxzIHVzaW5nIFwiL2h0dHA6XCIgb3IgXCIvaHR0cHM6XCJcbiAgICAhcmVkaXJlY3RQYXRoLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnL2h0dHAnKVxuXG4gIHJldHVybiBpc1NhZmVSZWRpcmVjdCA/IHJlZGlyZWN0UGF0aCA6IGZhbGxiYWNrXG59XG4iXSwibmFtZXMiOlsiZ2V0U2FmZVJlZGlyZWN0IiwicmVkaXJlY3RQYXJhbSIsImZhbGxiYWNrIiwicmVkaXJlY3RQYXRoIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwidHJpbSIsImlzU2FmZVJlZGlyZWN0Iiwic3RhcnRzV2l0aCIsInRvTG93ZXJDYXNlIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU1BLGtCQUFrQixDQUFDQyxlQUFrQ0MsV0FBbUIsR0FBRztJQUN0RixJQUFJLE9BQU9ELGtCQUFrQixVQUFVO1FBQ3JDLE9BQU9DO0lBQ1Q7SUFFQSxnQ0FBZ0M7SUFDaEMsSUFBSUM7SUFDSixJQUFJO1FBQ0ZBLGVBQWVDLG1CQUFtQkgsY0FBY0ksSUFBSTtJQUN0RCxFQUFFLE9BQU07UUFDTixPQUFPSCxTQUFTLG1CQUFtQjs7SUFDckM7SUFFQSxNQUFNSSxpQkFDSiwwREFBMEQ7SUFDMURILGFBQWFJLFVBQVUsQ0FBQyxRQUN4Qix5REFBeUQ7SUFDekQsQ0FBQ0osYUFBYUksVUFBVSxDQUFDLFNBQ3pCLGtFQUFrRTtJQUNsRSxDQUFDSixhQUFhSSxVQUFVLENBQUMsV0FDekIsMEdBQTBHO0lBQzFHLENBQUNKLGFBQWFJLFVBQVUsQ0FBQyxXQUN6QixDQUFDSixhQUFhSSxVQUFVLENBQUMsWUFDekIsQ0FBQ0osYUFBYUksVUFBVSxDQUFDLFVBQ3pCLGtFQUFrRTtJQUNsRSxDQUFDSixhQUFhSyxXQUFXLEdBQUdELFVBQVUsQ0FBQyxtQkFDdkMsd0VBQXdFO0lBQ3hFLENBQUNKLGFBQWFLLFdBQVcsR0FBR0QsVUFBVSxDQUFDO0lBRXpDLE9BQU9ELGlCQUFpQkgsZUFBZUQ7QUFDekMsRUFBQyJ9