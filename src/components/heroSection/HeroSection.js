"use client";

import Link from "next/link";
import { Container, Row, Col } from "react-bootstrap";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Navigation, Autoplay } from "swiper/modules";

import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.holderContent}>
      <Container>
        <Row className="align-items-stretch">
          {/* LEFT CATEGORY LIST */}
          <Col lg={3}>
            <div
              className={styles.firstSlide}
              data-aos="fade-right"
              data-aos-duration="550"
            >
              <ul>
                <li><Link href="/">Laptop</Link></li>
                <li><Link href="/">PC & Computers</Link></li>
                <li><Link href="/">Cell Phones</Link></li>
                <li><Link href="/">Tablets</Link></li>
                <li><Link href="/">Gaming & VR</Link></li>
                <li><Link href="/">Networking</Link></li>
                <li><Link href="/">Cameras</Link></li>
                <li><Link href="/">Office</Link></li>
                <li><Link href="/">Storage, USB</Link></li>
                <li><Link href="/">Accessories</Link></li>
                <li><Link href="/">Clearance</Link></li>
              </ul>
            </div>
          </Col>

          {/* CENTER */}
          <Col lg={6}>
            <Row className="g-4">
              {/* MAIN SLIDER */}
              <Col lg={12}>
                <div data-aos="zoom-in" data-aos-duration="650">
<Swiper
  slidesPerView={1}
  spaceBetween={30}
  loop={true}
  autoplay={{
    delay: 3500,                // كل 3 ثواني
    disableOnInteraction: false // يكمل حتى بعد ما المستخدم يضغط/يسحب
  }}
  pagination={{ clickable: true }}
  modules={[Pagination, Navigation, Autoplay]}
  className="mySwiper"
>
                    <SwiperSlide>
                      <div className={styles.secondSlide}>
                        <h3>
                          Noise Cancelling <span>Headphone</span>
                        </h3>
                        <p>
                          Boso Over-Ear Headphone Wifi, Voice Assistant, Low
                          latency game mode
                        </p>
                        <Link href="/">BUY NOW</Link>
                      </div>
                    </SwiperSlide>

                    <SwiperSlide>
                      <div className={styles.secondSlide}>
                        <h3>
                          Noise Cancelling <span>Headphone</span>
                        </h3>
                        <p>
                          Boso Over-Ear Headphone Wifi, Voice Assistant, Low
                          latency game mode
                        </p>
                        <Link href="/">BUY NOW</Link>
                      </div>
                    </SwiperSlide>

                    <SwiperSlide>
                      <div className={styles.secondSlide}>
                        <h3>
                          Noise Cancelling <span>Headphone</span>
                        </h3>
                        <p>
                          Boso Over-Ear Headphone Wifi, Voice Assistant, Low
                          latency game mode
                        </p>
                        <Link href="/">BUY NOW</Link>
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
              </Col>

              {/* BOTTOM LEFT CARD */}
              <Col lg={6}>
                <div
                  className={styles.thirdSlide}
                  data-aos="fade-up"
                  data-aos-delay="100"
                  data-aos-duration="600"
                >
                  <p>
                    Sono Playgo 5 from <span>$569</span>
                  </p>
                  <Link href="/">Discover now</Link>
                </div>
              </Col>

              {/* BOTTOM RIGHT CARD */}
              <Col lg={6}>
                <div
                  className={styles.fourthSlide}
                  data-aos="fade-up"
                  data-aos-delay="200"
                  data-aos-duration="600"
                >
                  <p>
                    Logitek Bluetooth <span>Keyboard</span>
                  </p>
                  <Link href="/">Discover now</Link>
                </div>
              </Col>
            </Row>
          </Col>

          {/* RIGHT */}
          <Col lg={3}>
            <Row className="g-4">
              {/* TOP RIGHT CARD */}
              <Col lg={12}>
                <div
                  className={styles.fivethSlide}
                  data-aos="fade-left"
                  data-aos-delay="150"
                  data-aos-duration="600"
                >
                  <div>
                    <span>xomia</span>
                    <p>Sport Water Resistance Watch</p>
                    <Link href="/">Shop Now</Link>
                  </div>
                </div>
              </Col>

              {/* BOTTOM RIGHT CARD */}
              <Col lg={12}>
                <div
                  className={styles.sixthSlide}
                  data-aos="fade-left"
                  data-aos-delay="250"
                  data-aos-duration="600"
                >
                  <p>
                    OKODo <span>hero 11+ black</span>
                  </p>
                  <span>FROM</span>
                  <p>$169</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
}