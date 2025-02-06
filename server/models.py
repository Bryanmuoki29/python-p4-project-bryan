from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy_serializer import SerializerMixin

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)
db = SQLAlchemy(metadata=metadata)

class UserType(db.Model, SerializerMixin):
    __tablename__ = 'user_types'

    serialize_rules = ('-users',)  # Exclude the 'users' relationship to avoid circular reference during serialization

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    # Relationship with User model
    users = db.relationship('User', back_populates='user_type')

# User model
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = ('-room_bookings', '-amenity_bookings')  # Excluding the entire relationship to avoid circular reference

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String)  # Store plain-text password
    name = db.Column(db.String)  # Add name field to the model

    user_type_id = db.Column(db.Integer, db.ForeignKey('user_types.id'))

    # Relationships
    room_bookings = db.relationship('UserRoomBooking', back_populates='user', lazy='subquery')
    amenity_bookings = db.relationship('UserAmenityBooking', back_populates='user', lazy='subquery')
    user_type = db.relationship('UserType', back_populates='users')


# Room model
class Room(db.Model, SerializerMixin):
    __tablename__ = 'rooms'

    serialize_rules = ('-user_room_bookings.room',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    type = db.Column(db.String)
    price = db.Column(db.Numeric)
    description = db.Column(db.String(255))

    # Foreign key to Users (rooms booked by users)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationship
    user_room_bookings = db.relationship('UserRoomBooking', back_populates='room')


# Amenity model
class Amenity(db.Model, SerializerMixin):
    __tablename__ = 'amenities'

    serialize_rules = ('-user_amenity_bookings.amenity',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    type = db.Column(db.String)
    charges = db.Column(db.Numeric)

    # Foreign key to Users 
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationship
    user_amenity_bookings = db.relationship('UserAmenityBooking', back_populates='amenity')


# User Amenity Booking model
class UserAmenityBooking(db.Model, SerializerMixin):
    __tablename__ = 'user_amenity_bookings'

    serialize_rules = ('-user_amenity_bookings.user', '-user_amenity_bookings.amenity')

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    amenity_id = db.Column(db.Integer, db.ForeignKey('amenities.id'))
    booking_time = db.Column(db.DateTime)

    # Relationships
    user = db.relationship('User', back_populates='amenity_bookings')
    amenity = db.relationship('Amenity', back_populates='user_amenity_bookings')


# User Room Booking model
class UserRoomBooking(db.Model, SerializerMixin):
    __tablename__ = 'user_room_bookings'

    serialize_rules = ('-user_room_bookings.user', '-user_room_bookings.room')

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'))
    check_in_date = db.Column(db.DateTime)
    check_out_date = db.Column(db.DateTime)

    # Relationships
    user = db.relationship('User', back_populates='room_bookings')
    room = db.relationship('Room', back_populates='user_room_bookings')
