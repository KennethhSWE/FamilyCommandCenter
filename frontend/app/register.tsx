import { Redirect } from "expo-router";

export default function RegisterRedirect() {
  return <Redirect href={"/setup/parent" as any} />;
}
