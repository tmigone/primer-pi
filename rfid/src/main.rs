//! Raspberry Pi 4 demo.
//! This example makes use the `std` feature
//! and `anyhow` dependency to make error handling more ergonomic.
//!
//! # Connections
//!
//! - 3V3    = VCC
//! - GND    = GND
//! - GPIO9  = MISO
//! - GPIO10 = MOSI
//! - GPIO11 = SCLK (SCK)
//! - GPIO22 = NSS  (SDA)

use linux_embedded_hal as hal;

use std::fs::File;
use std::io::Write;

use anyhow::Result;
use embedded_hal::delay::DelayNs;
use embedded_hal_bus::spi::ExclusiveDevice;
use hal::spidev::{SpiModeFlags, SpidevOptions};
use hal::{Delay, SpidevBus, SysfsPin};
use mfrc522::comm::{blocking::spi::SpiInterface, Interface};
use mfrc522::{Initialized, Mfrc522};

fn main() -> Result<()> {
    let mut delay = Delay;

    let mut spi = SpidevBus::open("/dev/spidev0.0").unwrap();
    let options = SpidevOptions::new()
        .max_speed_hz(1_000_000)
        .mode(SpiModeFlags::SPI_MODE_0 | SpiModeFlags::SPI_NO_CS)
        .build();
    spi.configure(&options).unwrap();

    // software-controlled chip select pin
    let pin = SysfsPin::new(22);
    pin.export().unwrap();
    while !pin.is_exported() {}
    delay.delay_ms(500u32); // delay sometimes necessary because `is_exported()` returns too early?
    let pin = pin.into_output_pin(embedded_hal::digital::PinState::High).unwrap();

    let spi = ExclusiveDevice::new(spi, pin, Delay);
    let itf = SpiInterface::new(spi);
    let mut mfrc522 = Mfrc522::new(itf).init()?;

    let vers = mfrc522.version()?;

    println!("VERSION: 0x{:x}", vers);

    assert!(vers == 0x91 || vers == 0x92);

    loop {
        const CARD_UID: [u8; 4] = [34, 246, 178, 171];
        const TAG_UID: [u8; 4] = [128, 170, 179, 76];

        if let Ok(atqa) = mfrc522.reqa() {
            if let Ok(uid) = mfrc522.select(&atqa) {
                println!("UID: {:?}", uid.as_bytes());

                if uid.as_bytes() == &CARD_UID {
                    println!("CARD");
                } else if uid.as_bytes() == &TAG_UID {
                    println!("TAG");
                }
            }
        }

        delay.delay_ms(1000u32);
    }
}
