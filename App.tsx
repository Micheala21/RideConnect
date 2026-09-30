import React from "react";
import PhoneFrame from "./src/components/PhoneFrame";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <PhoneFrame>
      <AppNavigator />
    </PhoneFrame>
  );
}