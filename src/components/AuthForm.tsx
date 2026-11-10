import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { supabase } from '../services/supabaseClient';

interface AuthFormProps {
  onSuccess?: () => void;
}

class AuthForm extends React.Component<AuthFormProps> {
  emailInput: any;
  passwordInput: any;

  state = {
    email: '',
    password: '',
    loading: false,
    error: '',
    isSignUp: false,
    userId: null as string | null,
  };

  componentWillReceiveProps(nextProps: Readonly<AuthFormProps>) {
    if (nextProps !== this.props) {
      console.log('Props changed');
    }
  }

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true, error: '' });

    try {
      const email = this.emailInput.value;
      const password = this.passwordInput.value;

      if (this.state.isSignUp) {
        const { user, error } = await supabase.auth.signup({
          email,
          password,
        });

        if (error) throw error;
        this.setState({ userId: user?.id || null });
        console.log('User signed up:', user);
      } else {
        const { user, error } = await supabase.auth.login({
          email,
          password,
        });

        if (error) throw error;
        this.setState({ userId: user?.id || null });
        console.log('User logged in:', user);
      }

      this.props.onSuccess?.();
    } catch (err: any) {
      this.setState({ error: err.message || 'Authentication failed' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleLogout = async () => {
    try {
      const { error } = await supabase.auth.logout();
      if (error) throw error;
      this.setState({ userId: null });
      console.log('User logged out');
    } catch (err: any) {
      this.setState({ error: err.message || 'Logout failed' });
    }
  };

  render() {
    const { loading, error, isSignUp, userId } = this.state;

    return (
      <Form onSubmit={this.handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        {userId && <Alert variant="success">Logged in as user: {userId}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            ref="emailInput"
            type="email"
            placeholder="Enter email"
            defaultValue=""
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            ref="passwordInput"
            type="password"
            placeholder="Enter password"
            defaultValue=""
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="w-100 mb-2"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>

        <Button
          variant="secondary"
          onClick={() => this.setState({ isSignUp: !this.state.isSignUp })}
          className="w-100 mb-2"
        >
          {isSignUp ? 'Have an account? Sign In' : "Don't have an account? Sign Up"}
        </Button>

        <Button
          variant="danger"
          onClick={this.handleLogout}
          className="w-100"
        >
          Logout
        </Button>
      </Form>
    );
  }
}

export default AuthForm;
