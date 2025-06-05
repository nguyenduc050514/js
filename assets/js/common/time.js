function start24HourCountdown(displaySelector) {
   console.log(displaySelector);
   const countdownTime = 24 * 60 * 60 * 1000;
   const endTime = Date.now() + countdownTime;
   function updateCountdown() {
      const now = Date.now();
      const timeLeft = Math.max(0, endTime - now);

      const hours = String(Math.floor(timeLeft / (1000 * 60 * 60))).padStart(
         2,
         "0"
      );
      const minutes = String(
         Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      const seconds = String(
         Math.floor((timeLeft % (1000 * 60)) / 1000)
      ).padStart(2, "0");

      displaySelector.textContent = `${hours}:${minutes}:${seconds}`;

      if (timeLeft <= 0) {
         clearInterval(timer);
         console.log("Countdown ended!");
      }
   }
   updateCountdown();
   const timer = setInterval(updateCountdown, 1000);
}

function getTimeAfter24Hours() {
   const now = new Date();
   console.log("Thời gian hiện tại:", now.toLocaleString());
   const nowHour = now.toLocaleString();
   const after24Hours = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
   ).toLocaleString();
   return { nowHour, after24Hours };
}
export { start24HourCountdown, getTimeAfter24Hours };
