'use server';

export async function subscribeToPushNotifications(subscription: unknown) {
  // TODO: implement saving subscription to DB
  console.log(subscription);
}

export async function sendPushNotification(payload: unknown) {
  // TODO: implement sending via web-push
  console.log(payload);
}
