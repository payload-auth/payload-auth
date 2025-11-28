import React from 'react';
import type { PasskeyWithId } from './types';
interface PasskeyListProps {
    passkeys: PasskeyWithId[];
    onDelete?: (id: string) => void;
}
export declare const PasskeyList: React.FC<PasskeyListProps>;
export {};
//# sourceMappingURL=list.d.ts.map