import { useLoadScript } from "@react-google-maps/api";
import CSVinput from "../components/input";
import Map from "../components/map";
import Login from "../components/Login";

export default function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBqwoO2n5ZwHpS7VVGubtBcSse-GlfATzE",
    libraries: ["places"],
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <Login />
    </div>
  );
}

