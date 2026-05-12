import { Redirect } from "expo-router";

export default function OldAddKidsRedirect() {
  return <Redirect href={"/setup/kids" as any} />;
}
