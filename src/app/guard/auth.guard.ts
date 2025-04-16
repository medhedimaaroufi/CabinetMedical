import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { JwtPayload, jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const storedEmail = localStorage.getItem('email');
  const storedId = localStorage.getItem('id');
  const screenPath = state.url;

  console.log('Token:', token);
  console.log('Stored email:', storedEmail);
  console.log('Stored id:', storedId);

  const logoutAndRedirect = () => {
    console.log('Logging out and redirecting to login');
    authService.logout();
    router.navigate(['/login']);
    return false;
  };

  if (!token || !storedEmail || !storedId) {
    console.log('Missing token, email, or id');
    return logoutAndRedirect();
  }

  const decodedToken = jwtDecode(token);
  console.log('Decoded token:', decodedToken);

  // Check token expiration with buffer
  const bufferSeconds = 5;
  if (decodedToken.exp && decodedToken.exp < Date.now() / 1000 + bufferSeconds) {
    console.log('Token expired');
    return logoutAndRedirect();
  }

  // Validate required token claims

  // @ts-ignore
  if (!decodedToken.sub?.role || !decodedToken.sub?.id || !decodedToken.sub?.email) {
    console.error('Missing required token claims (role, id, or email)');
    return logoutAndRedirect();
  }

  // Verify token data against local storage
  // @ts-ignore
  if (decodedToken.sub?.id !== storedId || decodedToken.sub?.email !== storedEmail) {
    // @ts-ignore
    console.error(`Token data mismatch: Token ID (${decodedToken.sub?.id}) vs Stored ID (${storedId}), Token Email (${decodedToken.sub?.email}) vs Stored Email (${storedEmail})`);
    return logoutAndRedirect();
  }

  // Role-based navigation
  // @ts-ignore
  const role = decodedToken.sub?.role;
  const roleDashboardMap: Record<string, string> = {
    patient: '/patient',
    doctor: '/doctor',
    admin: '/admin',
  };

  const userDashboard = roleDashboardMap[role];
  if (userDashboard && !screenPath.startsWith(userDashboard)) {
    console.log(`${role} redirected to ${userDashboard}`);
    router.navigate([userDashboard]);
    return false;
  }

  // Prevent access to login/signup when authenticated
  if (screenPath.startsWith('/login') || screenPath.startsWith('/signup-patient')) {
    console.log('Redirecting from login/signup to home');
    router.navigate(['/']);
    return false;
  }

  console.log('Authentication and authorization successful');
  return true;
};
