export function getTimestampFields(options = {
    saveUpdatedAtToJWT: true,
    saveCreatedAtToJWT: true
}) {
    return [
        {
            name: 'updatedAt',
            type: 'date',
            saveToJWT: options.saveUpdatedAtToJWT,
            admin: {
                disableBulkEdit: true,
                hidden: true
            },
            index: true,
            label: ({ t })=>t('general:updatedAt')
        },
        {
            name: 'createdAt',
            saveToJWT: options.saveCreatedAtToJWT,
            admin: {
                disableBulkEdit: true,
                hidden: true
            },
            type: 'date',
            index: true,
            label: ({ t })=>t('general:createdAt')
        }
    ];
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3V0aWxzL2dldC10aW1lc3RhbXAtZmllbGRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRmllbGQgfSBmcm9tICdwYXlsb2FkJ1xuXG5pbnRlcmZhY2UgR2V0VGltZXN0YW1wRmllbGRzT3B0aW9ucyB7XG4gIHNhdmVVcGRhdGVkQXRUb0pXVD86IGJvb2xlYW5cbiAgc2F2ZUNyZWF0ZWRBdFRvSldUPzogYm9vbGVhblxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGltZXN0YW1wRmllbGRzKFxuICBvcHRpb25zOiBHZXRUaW1lc3RhbXBGaWVsZHNPcHRpb25zID0ge1xuICAgIHNhdmVVcGRhdGVkQXRUb0pXVDogdHJ1ZSxcbiAgICBzYXZlQ3JlYXRlZEF0VG9KV1Q6IHRydWVcbiAgfVxuKTogRmllbGRbXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbmFtZTogJ3VwZGF0ZWRBdCcsXG4gICAgICB0eXBlOiAnZGF0ZScsXG4gICAgICBzYXZlVG9KV1Q6IG9wdGlvbnMuc2F2ZVVwZGF0ZWRBdFRvSldULFxuICAgICAgYWRtaW46IHtcbiAgICAgICAgZGlzYWJsZUJ1bGtFZGl0OiB0cnVlLFxuICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgIH0sXG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGxhYmVsOiAoeyB0IH0pID0+IHQoJ2dlbmVyYWw6dXBkYXRlZEF0JylcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdjcmVhdGVkQXQnLFxuICAgICAgc2F2ZVRvSldUOiBvcHRpb25zLnNhdmVDcmVhdGVkQXRUb0pXVCxcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICB9LFxuICAgICAgdHlwZTogJ2RhdGUnLFxuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBsYWJlbDogKHsgdCB9KSA9PiB0KCdnZW5lcmFsOmNyZWF0ZWRBdCcpXG4gICAgfVxuICBdXG59XG4iXSwibmFtZXMiOlsiZ2V0VGltZXN0YW1wRmllbGRzIiwib3B0aW9ucyIsInNhdmVVcGRhdGVkQXRUb0pXVCIsInNhdmVDcmVhdGVkQXRUb0pXVCIsIm5hbWUiLCJ0eXBlIiwic2F2ZVRvSldUIiwiYWRtaW4iLCJkaXNhYmxlQnVsa0VkaXQiLCJoaWRkZW4iLCJpbmRleCIsImxhYmVsIiwidCJdLCJtYXBwaW5ncyI6IkFBT0EsT0FBTyxTQUFTQSxtQkFDZEMsVUFBcUM7SUFDbkNDLG9CQUFvQjtJQUNwQkMsb0JBQW9CO0FBQ3RCLENBQUM7SUFFRCxPQUFPO1FBQ0w7WUFDRUMsTUFBTTtZQUNOQyxNQUFNO1lBQ05DLFdBQVdMLFFBQVFDLGtCQUFrQjtZQUNyQ0ssT0FBTztnQkFDTEMsaUJBQWlCO2dCQUNqQkMsUUFBUTtZQUNWO1lBQ0FDLE9BQU87WUFDUEMsT0FBTyxDQUFDLEVBQUVDLENBQUMsRUFBRSxHQUFLQSxFQUFFO1FBQ3RCO1FBQ0E7WUFDRVIsTUFBTTtZQUNORSxXQUFXTCxRQUFRRSxrQkFBa0I7WUFDckNJLE9BQU87Z0JBQ0xDLGlCQUFpQjtnQkFDakJDLFFBQVE7WUFDVjtZQUNBSixNQUFNO1lBQ05LLE9BQU87WUFDUEMsT0FBTyxDQUFDLEVBQUVDLENBQUMsRUFBRSxHQUFLQSxFQUFFO1FBQ3RCO0tBQ0Q7QUFDSCJ9