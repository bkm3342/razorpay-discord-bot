@bot.command()
async def pay(ctx, amount: int):
    # Razorpay Payment Link create
    url = "https://api.razorpay.com/v1/payment_links"
    data = {
        "amount": amount * 100,  # paise me
        "currency": "INR",
        "description": "Discord Bot Payment",
        "customer": {
            "name": ctx.author.name,
            "email": "test@example.com",  # optional
            "contact": "9999999999"       # optional
        },
        "notify": {"sms": False, "email": False},
        "callback_url": "https://yourdomain.com/payment-success",
        "callback_method": "get"
    }

    response = requests.post(url, auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET), json=data)
    link = response.json()["short_url"]

    # QR code generate
    qr = qrcode.make(link)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    file = discord.File(buffer, filename="payment_qr.png")

    embed = discord.Embed(
        title="💳 Payment QR",
        description=f"Scan kare ya [click kare]({link}) to pay ₹{amount}",
        color=discord.Color.green()
    )
    embed.set_image(url="attachment://payment_qr.png")

    await ctx.send(embed=embed, file=file)
