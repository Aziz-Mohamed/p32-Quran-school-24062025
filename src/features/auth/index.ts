// Services
export { authService } from './services/auth.service';

// Types
export type {
  LoginInput,
  CreateSchoolInput,
  CreateSchoolResponse,
  CreateMemberInput,
  CreateMemberResponse,
  ResetMemberPasswordInput,
  AuthError,
  AuthResult,
  Profile,
} from './types/auth.types';
export { buildSyntheticEmail } from './types/auth.types';

// Hooks
export { useLogin } from './hooks/useLogin';
export { useLogout } from './hooks/useLogout';
export { useCurrentUser } from './hooks/useCurrentUser';

// Components
export { AuthFormField } from './components/AuthFormField';
