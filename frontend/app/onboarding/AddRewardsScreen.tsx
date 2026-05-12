import { Redirect } from "expo-router";

export default function OldAddRewardsRedirect() {
  return <Redirect href={"/setup/rewards" as any} />;
}
