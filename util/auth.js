import axios from "axios";
const API_KEY = 'AIzaSyAM2ijQch2X6J9qaHT7IPH5zTJKzQXYXd0';

async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;
  try {
    const response = await axios.post(url, {
      email: email,
      password: password,
      returnSecureToken: true,
    });
    console.log(response.data);
  } catch (error) {
    console.error('Authentication error:', error.response ? error.response.data : error.message);
    throw error; // Rethrow the error if you want it to be handled in the calling function
  }
}

export async function createUser({email, password}) {
 await authenticate('signUp' , email, password);
}


export async function login({email,password}) {
  await authenticate('signInWithPassword',email,password);
}