## cmd lines used during development

```bash
docker run --name yourcontainername -e POSTGRES_USER=yourusernamewithoutspace -e POSTGRES_PASSWORD=yourpasswordwithoutspecialcharacters -
```

To migrate prisma file, 
```bash
npx prisma generate
```
To migrate prisma file

```bash
npx prisma migrate dev
```
```bash
npx prisma db push
```
To generate random key
```bash
openssl rand -hex 32
```

if any changes made in model file, we follow these cmd line to generate and migrate prisma files
```bash
npx prisma generate
npx prisma migrate dev
```