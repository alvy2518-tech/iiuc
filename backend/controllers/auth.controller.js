const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Sign up new user
 */
const signup = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.validatedData;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        error: 'Signup Failed',
        message: authError.message
      });
    }

    // Create profile using admin client to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: role,
        full_name: fullName,
        email: email
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({
        error: 'Profile Creation Failed',
        message: 'User created but profile setup failed'
      });
    }

    // Create role-specific profile with default values
    if (role === 'recruiter') {
      const { error: recruiterError } = await supabaseAdmin
        .from('recruiter_profiles')
        .insert({
          user_id: authData.user.id,
          company_name: 'Not Set',
          country: 'Not Set',
          city: 'Not Set'
        });

      if (recruiterError) {
        console.error('Recruiter profile creation error:', recruiterError);
      }
    } else if (role === 'candidate') {
      const { error: candidateError } = await supabaseAdmin
        .from('candidate_profiles')
        .insert({
          user_id: authData.user.id,
          profile_type: 'Professional'
        });

      if (candidateError) {
        console.error('Candidate profile creation error:', candidateError);
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role,
        fullName: fullName
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create user'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: 'Login Failed',
        message: error.message
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role,
        fullName: profile?.full_name
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login'
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.signOut(token);
    }

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to logout'
    });
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        error: 'Profile Not Found',
        message: 'User profile does not exist'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
        fullName: profile.full_name,
        phoneNumber: profile.phone_number,
        profilePictureUrl: profile.profile_picture_url
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user'
    });
  }
};

/**
 * Verify email with token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing Token',
        message: 'Verification token is required'
      });
    }

    // Verify the email with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    });

    if (error) {
      return res.status(400).json({
        error: 'Verification Failed',
        message: error.message
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      message: 'Email verified successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role,
        fullName: profile?.full_name
      },
      session: data.session
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify email'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  verifyEmail
};

