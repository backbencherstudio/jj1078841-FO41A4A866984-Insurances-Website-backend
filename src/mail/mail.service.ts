import { Injectable } from '@nestjs/common';
import appConfig from '../config/app.config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Template } from 'ejs';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('mail-queue') private queue: Queue,
    private mailerService: MailerService,
  ) {}

  async sendMessageToAdmin({email, phone_number, message}){
    try {
     
      const from = `${appConfig().app.name} <${appConfig().mail.from}>`
      const subject = 'User Requested Message'
      const to = appConfig().mail.user

      let msgText = message;
      if (typeof message === 'object' && message.message) {
        msgText = message.message; // ✅ শুধু ভিতরের টেক্সট নেবে
      }
    
      await this.queue.add('sendMessageToAdmin',{
        to:to,
        from:from,
        subject:subject,
        template:'user-message',
        context:{
          phone_number: phone_number,
          email: email,
          message: msgText,
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  async sendEmailToTheAdmin({name, phone_number, email, signupDate}){
    try {
     
      const from = `${appConfig().app.name} <${appConfig().mail.from}>`
      const subject = 'New User SignUp Notification'
      const to = appConfig().mail.user
      console.log(to)
      await this.queue.add('sendEmailToAdmin',{
        to:to,
        from:from,
        subject:subject,
        template:'admin-get-notification',
        context:{
          name: name,
          phone_number: phone_number,
          email: email,
          signupDate: signupDate
        }
      })
    } catch (error) {
      console.log(error)
    }
  }


  async sendMemberInvitation({ user, member, url }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = `${user.fname} is inviting you to ${appConfig().app.name}`;

      // add to queue
      await this.queue.add('sendMemberInvitation', {
        to: member.email,
        from: from,
        subject: subject,
        template: 'member-invitation',
        context: {
          user: user,
          member: member,
          url: url,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  // send otp code for email verification
  async sendOtpCodeToEmail({ name, email, otp }) {
    try {
      const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
      const subject = 'Email Verification';
      
      // add to queue
      await this.queue.add('sendOtpCodeToEmail', {
        to: email,
        from: from,
        subject: subject,
        template: 'email-verification',
        context: {
          name: name,
          otp: otp,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendVerificationLink(params: {
    email: string;
    name: string;
    token: string;
    type: string;
  }) {
    const from = `${process.env.APP_NAME} <${appConfig().mail.from}>`;
    const verificationLink = `${appConfig().app.client_app_url}/verify-email?token=${params.token}&email=${params.email}&type=${params.type}`;

    await this.queue.add('sendVerificationLink', {
      to: params.email,
      from: from,
      subject: 'Verify Your Email',
      template: './verification-link',
      context: {
        name: params.name,
        verificationLink,
      },
    });
  }
}