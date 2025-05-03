## cmd lines used during development

```bash
docker run --name yourcontainername -e POSTGRES_USER=yourusernamewithoutspace -e POSTGRES_PASSWORD=yourpasswordwithoutspecialcharacters -
```

To migrate prisma file
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