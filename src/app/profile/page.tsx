import { cookies } from "next/headers";
import ProfileComponent from "./_components/ProfileComp";

const Profile = async() => {
    const cookiesStore = await cookies()
    const userId = cookiesStore.get("userId")?.value
    const res = await fetch(`http://localhost:3000/api/profile?userId=${userId}`, {
        method: 'GET',
    })
    
    if (!res.ok) {
        console.error(`Error fetching profile: ${res.status}`);
        return <div>Failed to load profile</div>;
    }
    
    const data = await res.json();
    
    return <ProfileComponent user={data} />;
}

export default Profile