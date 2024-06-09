import React from 'react';
import { useStorageState } from './useStorageState';
import { Alert } from 'react-native';


interface UserData {
    id: string;
    email: string;
    profileImage?: string; // Optional, add other properties as needed
}

interface SessionData {
    user: UserData;
    token: string; // Assume there's always a token string
}

const AuthContext = React.createContext<{
    signIn: (data: { user: UserData; token: string }) => void;
    signOut: () => void;
    updateProfileImage: (imageUrl: string) => void;
    session?: string | any;
    isLoading: boolean;
}>({
    signIn: () => { },
    signOut: () => null,
    updateProfileImage: () => { },
    session: null,
    isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
    const value = React.useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }

    return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState<SessionData>('session');

    const signIn = async ({ user, token }: any) => {

        const userData = { ...user, token };
        setSession(userData);

    };

    const updateProfileImage = (imageUrl: string) => {
        if (!session) {
            console.error('No session or user data available to update');
            return;
        }

        const updatedSession = {
            ...session,
            profileImage: imageUrl
        };

        setSession(updatedSession);
    };

    const signOut = () => {
        setSession(null);

    };

    return (
        <AuthContext.Provider
            value={{ signIn, signOut, session, isLoading, updateProfileImage }}>
            {props.children}
        </AuthContext.Provider>
    );
}
