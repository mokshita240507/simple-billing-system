print("=" * 60)
print("WELCOME TO SIMPLE BILLING SYSTEM")
print("=" * 60)

print("\nNOTE:")
print("Get 10% discount on purchase above ₹1000")

# Product Database
products = {
    1: ("Rice", 50),
    2: ("Sugar", 40),
    3: ("Milk", 30),
    4: ("Bread", 25),
    5: ("Tea", 100)
}

total_bill = 0
bill_details = []

# File to Store Registered Phone Numbers
phone_file = "registered_numbers.txt"

# Read Existing Numbers
try:
    file = open(phone_file, "r")
    registered_numbers = file.read().splitlines()
    file.close()

except:
    registered_numbers = []

# Customer Details
customer_name = input("\nEnter Customer Name: ")

# Phone Number Validation
while True:

    print("\nCountry Code: +91")

    phone_number = input("Enter 10-digit Phone Number: ")

    # Validation
    if len(phone_number) != 10 or not phone_number.isdigit():

        print("Invalid Number! Please enter exactly 10 digits.")

    elif phone_number in registered_numbers:

        print("This phone number is already registered!")

    else:

        registered_numbers.append(phone_number)

        file = open(phone_file, "a")
        file.write(phone_number + "\n")
        file.close()

        full_phone_number = "+91" + phone_number

        break

# Shopping Loop
while True:

    print("\nAvailable Products:")

    for key, value in products.items():
        print(f"{key}. {value[0]} - ₹{value[1]}")

    try:

        choice = int(input("\nEnter product number: "))

        if choice in products:

            quantity = int(input("Enter quantity: "))

            product_name = products[choice][0]
            product_price = products[choice][1]

            amount = product_price * quantity

            total_bill += amount

            bill_details.append(
                f"{product_name} | Qty: {quantity} | Amount: ₹{amount}"
            )

            print(f"{product_name} added successfully!")
            print(f"Amount = ₹{amount}")

        else:
            print("Invalid product choice!")

    except:
        print("Please enter valid input!")

    more = input("\nDo you want to add more items? (yes/no): ")

    if more.lower() != 'yes':
        break

# Discount Logic
discount = 0

if total_bill >= 1000:
    discount = total_bill * 0.10

final_amount = total_bill - discount

# Final Bill Display
print("\n" + "=" * 60)
print("FINAL BILL")
print("=" * 60)

print(f"Customer Name : {customer_name}")
print(f"Phone Number  : {full_phone_number}")

print("\nPurchased Items:")

for item in bill_details:
    print(item)

print("\n-----------------------------------")
print(f"Total Bill   : ₹{total_bill}")
print(f"Discount     : ₹{discount}")
print(f"Final Amount : ₹{final_amount}")
print("-----------------------------------")

print("\nThank You For Shopping!")

# Dynamic File Name
file_name = f"bill_{customer_name}.txt"

# Save Bill in Text File
file = open(file_name, "w")

file.write("=" * 60 + "\n")
file.write("SHOP BILL RECEIPT\n")
file.write("=" * 60 + "\n")

file.write(f"Customer Name : {customer_name}\n")
file.write(f"Phone Number  : {full_phone_number}\n\n")

file.write("Purchased Items:\n")

for item in bill_details:
    file.write(item + "\n")

file.write("\n-----------------------------------\n")
file.write(f"Total Bill   : ₹{total_bill}\n")
file.write(f"Discount     : ₹{discount}\n")
file.write(f"Final Amount : ₹{final_amount}\n")
file.write("-----------------------------------\n")

file.write("\nThank You For Shopping!\n")

file.close()

print(f"\nBill saved successfully as '{file_name}'")