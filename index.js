const embed = new EmbedBuilder()
  .setColor('#ED4245') // vermelho forte 🔥

  .setAuthor({
    name: tipo === 'anonimo' ? '👻 Remetente Desconhecido' : `✍️ ${interaction.user.username}`,
    iconURL: interaction.user.displayAvatarURL()
  })

  .setTitle('💌 𝑪𝑨𝑹𝑻𝑨 𝑹𝑬𝑪𝑬𝑩𝑰𝑫𝑨')

  .setDescription(`
╔══════════════════╗  
   ✉️ **NOVA MENSAGEM**  
╚══════════════════╝  

> 💬 ${msg}

━━━━━━━━━━━━━━━━━━━
`)

  .addFields(
    {
      name: '🎯 Destinatário',
      value: `> <@${user.id}>`,
      inline: true
    },
    {
      name: '📨 Tipo',
      value: tipo === 'anonimo' ? '> 👻 Anônima' : '> ✍️ Assinada',
      inline: true
    }
  )

  .setThumbnail(user.displayAvatarURL({ dynamic: true }))

  // 🔥 GIF VERMELHO (IMPACTO)
  .setImage('https://media.tenor.com/8rQeZ8YQ6xUAAAAC/red-aesthetic.gif')

  .setFooter({
    text: '💔 Correio Elegante • Uma mensagem foi entregue...',
  })

  .setTimestamp();
