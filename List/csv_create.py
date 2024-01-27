import csv

with open('list2.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    with open("list.csv") as file2:
        reader = csv.reader(file2)
        for row in reader:
            email=""
            if not "stemariebeaucamps.fr" in row[11]:
                email = row[2]+"."+row[1].replace("-", "")
                email = email.lower()
                email = email.replace("é", "e")
                email = email.replace("ë", "e")
                email = email.replace("è", "e")
                email = email.replace("ê", "e")
                email = email.replace("ç", "c")
                email = email.replace("à", "a")
                email = email.replace("ï", "i")
                email = email.replace("î", "i")
                email = email.replace("--", "-") 
                email = email.replace(" ", "-")
                email = email+"@stemariebeaucamps.fr"
                for let in email:
                    if (ord(let)<97 or ord(let)>122) and ord(let)!=64 and ord(let)!=45 and ord(let)!=46:
                        print(let)
                row[11]= email
            else:
                email=row[11]
            writer.writerow(row)