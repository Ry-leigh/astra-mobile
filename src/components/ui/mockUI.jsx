import { TouchableOpacity, Text } from "react-native";
import { useAuthStore } from "../../store/authStore";

export default function MockUI() {
    const { setAuth } = useAuthStore();

    const handleMockLogin = () => {
        // 1. Create the user object matching the store's logic (roles as objects with 'name')
        const mockUser = {
            id: 999,
            first_name: 'UI',
            last_name: 'Tester',
            email: 'ui-tester@astra.test',
            roles: [
                { name: 'program_head' },
                { name: 'instructor' },
                { name: 'student' }
            ]
        };

        // 2. Pass them as TWO separate arguments to match setAuth(user, token)
        setAuth(mockUser, 'mock_session_token_123');
    };

    return (
        <TouchableOpacity onPress={handleMockLogin} className="m-1 bg-white/10 p-2 rounded">
            <Text className="text-white text-xs">UI</Text>
        </TouchableOpacity>
    );
}