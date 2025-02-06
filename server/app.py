from flask import Flask, request, make_response
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_cors import CORS  # Import CORS
from models import db, User, Room, Amenity, UserRoomBooking, UserAmenityBooking
from datetime import datetime
app = Flask(__name__)

# Configure CORS to allow requests from React frontend
CORS(app, origins="http://localhost:3000", supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  
app.json.compact = False 

migrate = Migrate(app, db)
db.init_app(app)

api = Api(app)

class Home(Resource):
    def get(self):
        return {"message": "Welcome to the Booking API"}, 200

api.add_resource(Home, '/')  

class Users(Resource):
    def get(self):
        return [user.to_dict() for user in User.query.all()], 200

    def post(self):
        data = request.get_json()

        # Ensure all required fields are present
        if not all(key in data for key in ['username', 'email', 'password']):
            return {"error": "Username, email, and password are required"}, 400

        new_user = User(username=data['username'], email=data['email'], password=data['password'])  # Include password
        db.session.add(new_user)
        db.session.commit()
        return new_user.to_dict(), 201


api.add_resource(Users, '/users')  


class UserByID(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if user:
            return user.to_dict(), 200
        return {"message": "User not found"}, 404
    def delete(self, user_id):
        user = User.query.get(user_id)
        if user:
            try:
                User.query.filter_by(id=user_id).delete()  # Deletes the user
                db.session.commit()  # Commits the deletion to the database
                return {"message": "User successfully deleted"}, 200
            except Exception as e:
                db.session.rollback()  # In case of an error, rollback
                return {"message": "Error deleting user", "error": str(e)}, 500
        return {"message": "User not found"}, 404
api.add_resource(UserByID, '/users/<int:user_id>') 


class Rooms(Resource):
    def get(self):
        return [room.to_dict() for room in Room.query.all()], 200
    
    def post(self):
        data = request.get_json()
        new_room = Room(**data)
        db.session.add(new_room)
        db.session.commit()
        return new_room.to_dict(), 201

api.add_resource(Rooms, '/rooms')  

class Amenities(Resource):
    def get(self):
        return [amenity.to_dict() for amenity in Amenity.query.all()], 200
    
    def post(self):
        data = request.get_json()
        new_amenity = Amenity(**data)
        db.session.add(new_amenity)
        db.session.commit()
        return new_amenity.to_dict(), 201

api.add_resource(Amenities, '/amenities')

class UserRoomBookings(Resource):
    def get(self):
        return [booking.to_dict() for booking in UserRoomBooking.query.all()], 200
    
    def post(self):
        data = request.get_json()
        new_booking = UserRoomBooking(**data)
        db.session.add(new_booking)
        db.session.commit()
        return new_booking.to_dict(), 201

api.add_resource(UserRoomBookings, '/user_room_bookings')

class UserAmenityBookings(Resource):
    # GET method to retrieve all user amenity bookings
    def get(self):
        user_email = request.args.get('clientEmail')
        
        if not user_email:
            return {"message": "Client email is required"}, 400
        
        # Find the user by email
        user = User.query.filter_by(email=user_email).first()
        if not user:
            return {"message": "User not found"}, 404
        
        # Initialize a list to store the combined bookings
        bookings = []

        # Fetch all room bookings for this user
        room_bookings = UserRoomBooking.query.filter_by(user_id=user.id).all()
        for room_booking in room_bookings:
            bookings.append({
                "id": str(room_booking.id),
                "clientName": user.name,
                "clientEmail": user.email,
                "room": getattr(room_booking.room, "name", None),
                "cost": f"${getattr(room_booking.room, 'price', 'N/A')}/night",
                "description": getattr(room_booking.room, "description", "No description available"),
                "bookingDate": room_booking.check_in_date.strftime("%Y-%m-%d"),
                "bookingTime": room_booking.check_in_date.strftime("%H:%M"),
                "amenity": None  # This is a room booking, so amenity is null
            })

        # Fetch all amenity bookings for this user
        amenity_bookings = UserAmenityBooking.query.filter_by(user_id=user.id).all()
        for amenity_booking in amenity_bookings:
            bookings.append({
                "id": str(amenity_booking.id),
                "clientName": user.name,
                "clientEmail": user.email,
                "room": None,  # This is an amenity booking, so room is null
                "cost": f"${getattr(amenity_booking.amenity, 'cost', 'N/A')}/session",
                "description": getattr(amenity_booking.amenity, "description", "No description available"),
                "bookingDate": amenity_booking.booking_time.strftime("%Y-%m-%d"),
                "bookingTime": amenity_booking.booking_time.strftime("%H:%M"),
                "amenity": getattr(amenity_booking.amenity, "name", None)
            })

        return bookings, 200
    # POST method to create a new booking
    def post(self):
        data = request.get_json()

        # Ensure all required fields are present in the request data
        if not all(k in data for k in ['username', 'email', 'amenity_name', 'booking_date', 'booking_time']):
            return {"error": "Username, Email, Amenity Name, Booking Date, and Booking Time are required"}, 400
        
        # Find user by username and email
        user = User.query.filter_by(username=data['username'], email=data['email']).first()
        if not user:
            return {"error": "User not found"}, 404

        # Find the amenity by name
        amenity = Amenity.query.filter_by(name=data['amenity_name']).first()
        if not amenity:
            return {"error": "Amenity not found"}, 404

        # Convert booking_date and booking_time to a single datetime object
        try:
            booking_datetime = f"{data['booking_date']} {data['booking_time']}"
            booking_time = datetime.strptime(booking_datetime, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return {"error": "Invalid booking date or time format. Please use the correct format."}, 400
        
        # Create a new UserAmenityBooking object and associate it with the user and amenity
        new_booking = UserAmenityBooking(
            user_id=user.id,  # Use the user_id from the found user
            amenity_id=amenity.id,  # Use the amenity_id from the found amenity
            booking_time=booking_time
        )

        # Add the new booking to the session and commit
        try:
            db.session.add(new_booking)
            db.session.commit()
        except Exception as e:
            db.session.rollback()  # Rollback in case of an error
            return {"error": f"Error saving booking: {str(e)}"}, 500

        # Return the new booking as a dictionary (assuming 'to_dict()' method is implemented)
        return new_booking.to_dict(), 201
    def delete(self, booking_id):
        booking = UserAmenityBooking.query.get(booking_id)
        if booking:
            db.session.delete(booking)
            db.session.commit()
            return {"message": "Booking deleted successfully"}, 200
        return {"error": "Booking not found"}, 404

api.add_resource(UserAmenityBookings, '/amenity_bookings', '/amenity_bookings/<int:booking_id>')

# class UserBookings(Resource):
#     def get(self):
#         user_email = request.args.get('clientEmail')
#         if user_email:
#             user = User.query.filter_by(email=user_email).first()
#             if user:
#                 room_bookings = [b.to_dict() for b in UserRoomBooking.query.filter_by(user_id=user.id).all()]
#                 amenity_bookings = [b.to_dict() for b in UserAmenityBooking.query.filter_by(user_id=user.id).all()]
#                 return room_bookings + amenity_bookings, 200
#             return {"message": "User not found"}, 404
#         return {"message": "Client email is required"}, 400

# api.add_resource(UserBookings, '/bookings')

class RoomUsers(Resource):
    def get(self, room_id):
        bookings = UserRoomBooking.query.filter_by(room_id=room_id).all()
        users = [booking.user.to_dict() for booking in bookings]
        return users, 200

api.add_resource(RoomUsers, '/rooms/<int:room_id>/users')

class AmenityUsers(Resource):
    def get(self, amenity_id):
        bookings = UserAmenityBooking.query.filter_by(amenity_id=amenity_id).all()
        users = [booking.user.to_dict() for booking in bookings]
        return users, 200

api.add_resource(AmenityUsers, '/amenities/<int:amenity_id>/users')

class UserBookings(Resource):
    def get(self, client_email=None):
        if client_email:
            # Fetch bookings for a specific user based on email
            user = User.query.filter_by(email=client_email).first()
            if not user:
                return {"message": "User not found"}, 404

            bookings = []
            room_bookings = UserRoomBooking.query.filter_by(user_id=user.id).all()
            for room_booking in room_bookings:
                bookings.append({
                    "id": str(room_booking.id),
                    "clientName": user.name,
                    "clientEmail": user.email,
                    "room": room_booking.room.name,
                    "cost": f"${room_booking.room.price}/night",
                    "description": room_booking.room.description,
                    "bookingDate": room_booking.check_in_date.strftime("%Y-%m-%d"),
                    "bookingTime": room_booking.check_in_date.strftime("%H:%M"),
                    "amenity": None
                })

            amenity_bookings = UserAmenityBooking.query.filter_by(user_id=user.id).all()
            for amenity_booking in amenity_bookings:
                bookings.append({
                    "id": str(amenity_booking.id),
                    "clientName": user.name,
                    "clientEmail": user.email,
                    "room": None,
                    "cost": None,
                    "description": None,
                    "bookingDate": amenity_booking.booking_time.strftime("%Y-%m-%d"),
                    "bookingTime": amenity_booking.booking_time.strftime("%H:%M"),
                    "amenity": amenity_booking.amenity.name
                })

            return bookings, 200

        else:
            # Fetch all bookings for all users
            all_bookings = []

            room_bookings = UserRoomBooking.query.all()
            for room_booking in room_bookings:
                all_bookings.append({
                    "id": str(room_booking.id),
                    "clientName": room_booking.user.name,
                    "clientEmail": room_booking.user.email,
                    "room": room_booking.room.name,
                    "cost": f"${room_booking.room.price}/night",
                    "description": room_booking.room.description,
                    "bookingDate": room_booking.check_in_date.strftime("%Y-%m-%d"),
                    "bookingTime": room_booking.check_in_date.strftime("%H:%M"),
                    "amenity": None
                })

            amenity_bookings = UserAmenityBooking.query.all()
            for amenity_booking in amenity_bookings:
                all_bookings.append({
                    "id": str(amenity_booking.id),
                    "clientName": amenity_booking.user.name,
                    "clientEmail": amenity_booking.user.email,
                    "room": None,
                    "cost": None,
                    "description": None,
                    "bookingDate": amenity_booking.booking_time.strftime("%Y-%m-%d"),
                    "bookingTime": amenity_booking.booking_time.strftime("%H:%M"),
                    "amenity": amenity_booking.amenity.name
                })

            return all_bookings, 200

    def post(self):
        data = request.get_json()

        if not all(k in data for k in ['username', 'email', 'bookingDate', 'bookingTime']):
            return {"error": "Username, Email, Booking Date, and Booking Time are required"}, 400

        user = User.query.filter_by(username=data['username'], email=data['email']).first()
        if not user:
            return {"error": "User not found"}, 404

        if 'roomId' in data:
            room = Room.query.get(data['roomId'])
            if not room:
                return {"error": "Room not found"}, 404
            
            try:
                booking_time = datetime.strptime(f"{data['bookingDate']} {data['bookingTime']}", "%Y-%m-%d %H:%M")
                new_booking = UserRoomBooking(
                    user_id=user.id,
                    room_id=room.id,
                    check_in_date=booking_time,
                    check_out_date=booking_time  # Assuming the same time for check-out as check-in
                )
                db.session.add(new_booking)
                db.session.commit()
                return new_booking.to_dict(), 201
            except Exception as e:
                return {"error": f"Error creating room booking: {str(e)}"}, 500
        
        elif 'amenityId' in data:
            amenity = Amenity.query.get(data['amenityId'])
            if not amenity:
                return {"error": "Amenity not found"}, 404
            
            try:
                booking_time = datetime.strptime(f"{data['bookingDate']} {data['bookingTime']}", "%Y-%m-%d %H:%M")
                new_booking = UserAmenityBooking(
                    user_id=user.id,
                    amenity_id=amenity.id,
                    booking_time=booking_time
                )
                db.session.add(new_booking)
                db.session.commit()
                return new_booking.to_dict(), 201
            except Exception as e:
                return {"error": f"Error creating amenity booking: {str(e)}"}, 500
        
        else:
            return {"error": "Invalid booking type. Please provide either 'roomId' or 'amenityId'."}, 400

    def delete(self, booking_id):
        room_booking = UserRoomBooking.query.get(booking_id)
        amenity_booking = UserAmenityBooking.query.get(booking_id)

        if room_booking:
            try:
                db.session.delete(room_booking)
                db.session.commit()
                return {"message": "Room booking deleted successfully"}, 200
            except Exception as e:
                return {"error": f"Error deleting room booking: {str(e)}"}, 500
        
        elif amenity_booking:
            try:
                db.session.delete(amenity_booking)
                db.session.commit()
                return {"message": "Amenity booking deleted successfully"}, 200
            except Exception as e:
                return {"error": f"Error deleting amenity booking: {str(e)}"}, 500
        
        return {"error": "Booking not found"}, 404

    def put(self, booking_id):
        data = request.get_json()

        room_booking = UserRoomBooking.query.get(booking_id)
        amenity_booking = UserAmenityBooking.query.get(booking_id)

        if room_booking:
            try:
                room_booking.check_in_date = datetime.strptime(f"{data['bookingDate']} {data['bookingTime']}", "%Y-%m-%d %H:%M")
                db.session.commit()
                return {"message": "Room booking updated successfully"}, 200
            except Exception as e:
                return {"error": f"Error updating room booking: {str(e)}"}, 500
        
        elif amenity_booking:
            try:
                amenity_booking.booking_time = datetime.strptime(f"{data['bookingDate']} {data['bookingTime']}", "%Y-%m-%d %H:%M")
                db.session.commit()
                return {"message": "Amenity booking updated successfully"}, 200
            except Exception as e:
                return {"error": f"Error updating amenity booking: {str(e)}"}, 500
        
        return {"error": "Booking not found"}, 404

api.add_resource(UserBookings, '/bookings', '/bookings/<string:client_email>', '/bookings/<int:booking_id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
