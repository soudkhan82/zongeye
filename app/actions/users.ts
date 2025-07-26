"use server";

import supabase from "../config/supabase-config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//Register user backend function
export const registerNewUser = async ({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  try {
    // check of user already exists using email
    const { data, error } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("email", email);
    if (data && data.length > 0) {
      return {
        success: false,
        message: "User already exists",
      };
    }
    //hash the password using bcrpyt

    const hashpassword = bcrypt.hashSync(password, 10);
    const newUserObj = {
      name,
      email,
      password: hashpassword,
      role,
      is_active: true,
    };
    // insert the new record in database

    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .insert(newUserObj);
    if (userError) {
      return {
        success: false,
        message: userError.message,
      };
    }
    return {
      success: true,
      message: "User Registered Successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const loginuser = async ({
  email,
  password,
  role,
}: {
  email: string;
  password: string;
  role: string;
}) => {
  try {
    //find the user with email
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
    if (data.length === 0) {
      return {
        success: false,
        message: "User not found",
      };
    }
    if (data[0].role !== role) {
      return {
        success: false,
        message: "Invalid role",
      };
    }

    //positive scenarios , compare the password

    const ispasswordvalid = bcrypt.compareSync(password, data[0].password);
    if (!ispasswordvalid) {
      return {
        success: false,
        message: "Invalid password",
      };
    }
    //generate JWT token
    const token = jwt.sign(
      {
        id: data[0].id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );
    return {
      success: true,
      data: token,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getCurrentUser = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId);

    if (!data || data?.length === 0 || error) {
      return {
        success: false,
        message: "User not found",
      };
    }
    return {
      success: true,
      data: data[0],
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message,
    };
  }
};
