import { Redirect } from "expo-router";

export default function OldAddChoresRedirect() {
  return <Redirect href={"/setup/chores" as any} />;
}
