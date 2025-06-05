class ImageSlider {
   constructor() {
      this.currentSlide = 0;
      this.totalSlides = 5; // Updated to match your slides
      this.isTransitioning = false;
      this.autoPlayInterval = null;
      this.autoPlayDelay = 4000;

      this.sliderWrapper = document.getElementById("sliderWrapper");
      this.prevBtn = document.getElementById("prevBtn");
      this.nextBtn = document.getElementById("nextBtn");
      this.dotsContainer = document.getElementById("dotsContainer");
      this.slideCounter = document.getElementById("slideCounter");
      this.progressBar = document.getElementById("progressBar");

      this.init();
   }

   init() {
      this.bindEvents();
      this.updateSlideCounter();
      this.updateProgressBar();
      this.startAutoPlay();
      document.addEventListener("keydown", (e) => {
         if (e.key === "ArrowLeft") this.prevSlide();
         if (e.key === "ArrowRight") this.nextSlide();
      });
      const sliderContainer = document.querySelector(".slider-container");
      sliderContainer.addEventListener("mouseenter", () => this.stopAutoPlay());
      sliderContainer.addEventListener("mouseleave", () =>
         this.startAutoPlay()
      );
   }

   bindEvents() {
      this.prevBtn.addEventListener("click", () => this.prevSlide());
      this.nextBtn.addEventListener("click", () => this.nextSlide());
      this.dotsContainer.addEventListener("click", (e) => {
         if (e.target.classList.contains("dot")) {
            const slideIndex = parseInt(e.target.dataset.slide);
            this.goToSlide(slideIndex);
         }
      });
      let startX = 0;
      let endX = 0;
      this.sliderWrapper.addEventListener(
         "touchstart",
         (e) => {
            startX = e.touches[0].clientX;
         },
         { passive: true }
      );

      this.sliderWrapper.addEventListener(
         "touchend",
         (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
         },
         { passive: true }
      );

      let isDragging = false;
      let dragStartX = 0;

      this.sliderWrapper.addEventListener("mousedown", (e) => {
         isDragging = true;
         dragStartX = e.clientX;
         this.sliderWrapper.style.cursor = "grabbing";
      });

      document.addEventListener("mousemove", (e) => {
         if (!isDragging) return;
         e.preventDefault();
      });

      document.addEventListener("mouseup", (e) => {
         if (!isDragging) return;
         isDragging = false;
         this.sliderWrapper.style.cursor = "grab";
         this.handleSwipe(dragStartX, e.clientX);
      });
   }

   handleSwipe(startX, endX) {
      const threshold = 50;
      const diff = startX - endX;

      if (Math.abs(diff) > threshold) {
         if (diff > 0) {
            this.nextSlide();
         } else {
            this.prevSlide();
         }
      }
   }

   nextSlide() {
      if (this.isTransitioning) return;
      this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
      this.updateSlider();
   }

   prevSlide() {
      if (this.isTransitioning) return;
      this.currentSlide =
         this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
      this.updateSlider();
   }

   goToSlide(index) {
      if (this.isTransitioning || index === this.currentSlide) return;
      this.currentSlide = index;
      this.updateSlider();
   }

   updateSlider() {
      this.isTransitioning = true;
      const translateX = -this.currentSlide * 100;
      this.sliderWrapper.style.transform = `translateX(${translateX}%)`;
      this.updateDots();
      this.updateSlideCounter();
      this.updateProgressBar();
      this.addSlideTransitionEffect();
      setTimeout(() => {
         this.isTransitioning = false;
      }, 800);
   }

   updateDots() {
      const dots = this.dotsContainer.querySelectorAll(".dot");
      dots.forEach((dot, index) => {
         dot.classList.toggle("active", index === this.currentSlide);
      });
   }

   updateSlideCounter() {
      this.slideCounter.textContent = `${this.currentSlide + 1} / ${
         this.totalSlides
      }`;
   }

   updateProgressBar() {
      const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
      this.progressBar.style.width = `${progress}%`;
   }

   addSlideTransitionEffect() {
      const slides = this.sliderWrapper.querySelectorAll(".slide");
      slides.forEach((slide, index) => {
         if (index === this.currentSlide) {
            slide.style.transform = "scale(1.02)";
            setTimeout(() => {
               slide.style.transform = "scale(1)";
            }, 400);
         }
      });
   }

   startAutoPlay() {
      this.stopAutoPlay();
      this.autoPlayInterval = setInterval(() => {
         this.nextSlide();
      }, this.autoPlayDelay);
   }

   stopAutoPlay() {
      if (this.autoPlayInterval) {
         clearInterval(this.autoPlayInterval);
         this.autoPlayInterval = null;
      }
   }

   play() {
      this.startAutoPlay();
   }

   pause() {
      this.stopAutoPlay();
   }

   getCurrentSlide() {
      return this.currentSlide;
   }

   getTotalSlides() {
      return this.totalSlides;
   }

   updateTotalSlides(newTotal) {
      this.totalSlides = newTotal;
      this.updateSlideCounter();
      this.updateProgressBar();
      if (this.currentSlide >= this.totalSlides) {
         this.currentSlide = 0;
         this.updateSlider();
      }
   }
}

export default ImageSlider;
