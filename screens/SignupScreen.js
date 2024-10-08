import { useState } from 'react';
import AuthContent from '../components/Auth/AuthContent';
import { createUser } from '../util/auth';
import LoadingOverlay from '../components/ui/LoadingOverlay';

export function SignupScreen() {
  const [isAuthenticating , setIsAuthenticating] = useState();
  async function signupHandler({email,password}){
    
    setIsAuthenticating(true);
    await createUser(email,password);
    setIsAuthenticating(false);
  }

  if(isAuthenticating){
    return <LoadingOverlay message="Creating a user..."/>
  }
  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;