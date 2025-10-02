// Main wrapper function
export async function tryCatch(promise) {
    try {
        const data = await promise;
        return {
            data,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error: error
        };
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvdXRpbHMvdHJ5LWNhdGNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbInR5cGUgU3VjY2VzczxUPiA9IHtcbiAgZGF0YTogVFxuICBlcnJvcjogbnVsbFxufVxuXG50eXBlIEZhaWx1cmU8RT4gPSB7XG4gIGRhdGE6IG51bGxcbiAgZXJyb3I6IEVcbn1cblxudHlwZSBSZXN1bHQ8VCwgRSA9IEVycm9yPiA9IFN1Y2Nlc3M8VD4gfCBGYWlsdXJlPEU+XG5cbi8vIE1haW4gd3JhcHBlciBmdW5jdGlvblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRyeUNhdGNoPFQsIEUgPSBFcnJvcj4ocHJvbWlzZTogUHJvbWlzZTxUPik6IFByb21pc2U8UmVzdWx0PFQsIEU+PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHByb21pc2VcbiAgICByZXR1cm4geyBkYXRhLCBlcnJvcjogbnVsbCB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZGF0YTogbnVsbCwgZXJyb3I6IGVycm9yIGFzIEUgfVxuICB9XG59XG4iXSwibmFtZXMiOlsidHJ5Q2F0Y2giLCJwcm9taXNlIiwiZGF0YSIsImVycm9yIl0sIm1hcHBpbmdzIjoiQUFZQSx3QkFBd0I7QUFDeEIsT0FBTyxlQUFlQSxTQUF1QkMsT0FBbUI7SUFDOUQsSUFBSTtRQUNGLE1BQU1DLE9BQU8sTUFBTUQ7UUFDbkIsT0FBTztZQUFFQztZQUFNQyxPQUFPO1FBQUs7SUFDN0IsRUFBRSxPQUFPQSxPQUFPO1FBQ2QsT0FBTztZQUFFRCxNQUFNO1lBQU1DLE9BQU9BO1FBQVc7SUFDekM7QUFDRiJ9