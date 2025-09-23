import React, { useEffect, useState } from 'react';
import supabase from './Supabase';
import { useRouter } from 'next/navigation'; 


const IsLoggedIn = (): [any | null, React.Dispatch<React.SetStateAction<any | null>>] => {
  const [user, setUser] = useState<any | null>(null);


  const router = useRouter();



  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } }: any = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }

      // if (!user && location.pathname.includes("/user/")) {
      //   router.push('/sign-in')
      // }


    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setUser(session?.user ?? null);
      }

    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);



  return [user, setUser];
};

export default IsLoggedIn;
