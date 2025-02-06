#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc
from faker import Faker
from datetime import datetime, timedelta

# Remote library imports
from app import app
from models import db, User, Room, Amenity, UserType, UserRoomBooking, UserAmenityBooking

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():  # Ensure the app context is available
        print("Starting seed...")

        # Clear out the existing data
        db.drop_all()
        db.create_all()

        # Seed UserTypes
        admin_type = UserType(name="Admin")
        client_type = UserType(name="Client")

        db.session.add_all([admin_type, client_type])
        db.session.commit()

        # Seed Users
        users = []
        for _ in range(50):  # Reduced to 50 users for efficiency
            password = fake.password()  # Generate a random password
            user_type = rc([admin_type, client_type])  # Randomly choose between Admin and Client types

            user = User(
                username=fake.user_name(),
                email=fake.email(),
                password=password,
                user_type_id=user_type.id
            )
            users.append(user)

        db.session.add_all(users)
        db.session.commit()

        # Seed Rooms
        rooms = []
        for _ in range(30):  # Reduced to 30 rooms
            room = Room(
                name=fake.word().capitalize(),
                type=rc(['Single', 'Double', 'Suite']),
                price=round(randint(100, 500) + randint(0, 99) / 100, 2),
                user_id=rc([user.id for user in users])  # Assign room to a random user
            )
            rooms.append(room)

        db.session.add_all(rooms)
        db.session.commit()

        # Seed Amenities
        amenities_data = [
            {'name': 'Wi-Fi', 'type': 'Wi-Fi', 'charges': 0},
            {'name': 'Outdoor Pool', 'type': 'Pool', 'charges': round(randint(10, 50) + randint(0, 99) / 100, 2)},
            {'name': 'Fine Dining Restaurant', 'type': 'Restaurant', 'charges': round(randint(30, 150) + randint(0, 99) / 100, 2)},
            {'name': 'Spa Services', 'type': 'Spa', 'charges': round(randint(50, 200) + randint(0, 99) / 100, 2)},
            {'name': 'Fitness Center', 'type': 'Gym', 'charges': round(randint(15, 75) + randint(0, 99) / 100, 2)},
            {'name': 'Canoeing', 'type': 'Water Sports', 'charges': round(randint(20, 100) + randint(0, 99) / 100, 2)}
        ]

        amenities = []
        for amenity in amenities_data:
            amenity_instance = Amenity(
                name=amenity['name'],
                type=amenity['type'],
                charges=amenity['charges'],
                user_id=rc([user.id for user in users])  # Assign to a random user
            )
            amenities.append(amenity_instance)

        db.session.add_all(amenities)
        db.session.commit()

        # Seed User Room Bookings
        room_bookings = []
        for _ in range(40):  # Seed 40 room bookings
            booking = UserRoomBooking(
                user_id=rc([user.id for user in users]),
                room_id=rc([room.id for room in rooms]),
                check_in_date=fake.date_time_between(start_date="-2y", end_date="now"),
                check_out_date=fake.date_time_between(start_date="now", end_date="+1y")
            )
            room_bookings.append(booking)

        db.session.add_all(room_bookings)
        db.session.commit()

        # Seed User Amenity Bookings
        amenity_bookings = []
        for _ in range(50):  # Seed 50 amenity bookings
            booking_time = fake.date_time_between(start_date="-1y", end_date="now")
            booking = UserAmenityBooking(
                user_id=rc([user.id for user in users]),
                amenity_id=rc([amenity.id for amenity in amenities]),
                booking_time=booking_time
            )
            amenity_bookings.append(booking)

        db.session.add_all(amenity_bookings)
        db.session.commit()

        print("Seed completed successfully!")
