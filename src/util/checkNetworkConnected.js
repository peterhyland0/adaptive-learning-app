import {fetch} from "@react-native-community/netinfo";

export default function checkNetworkConnected() {
  return new Promise((resolve) => {
    fetch().then(netInfoState => {
      resolve(netInfoState.isConnected);
    }).catch((netInfoError) => {
      console.log("NET INFO ERROR  :", netInfoError);
      resolve(false);
    });
  });
}