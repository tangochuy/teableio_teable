/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';
import type { DynamicModule } from '@nestjs/common';
import { ConfigurableModuleBuilder, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import type { IMailConfig } from '../../configs/mail.config';
import { helpers } from './mail-helpers';
import { MailSenderService } from './mail-sender.service';

export interface MailSenderModuleOptions {
  global?: boolean;
}

export const { ConfigurableModuleClass: MailSenderModuleClass, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<MailSenderModuleOptions>().build();

@Module({})
export class MailSenderModule extends MailSenderModuleClass {
  static register(options?: typeof OPTIONS_TYPE): DynamicModule {
    const { global } = options || {};

    const module = MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mailConfig = config.getOrThrow<IMailConfig>('mail');
        const templatePagesDir = path.join(__dirname, '/templates/pages');
        const templatePartialsDir = path.join(__dirname, '/templates/partials');

        Logger.log(`[Mail Template Pages Dir]: ${templatePagesDir}`);
        Logger.log(`[Mail Template Partials Dir]: ${templatePartialsDir}`);
        return {
          transport: {
            host: mailConfig.host,
            port: mailConfig.port,
            secure: mailConfig.secure,
            auth: {
              user: mailConfig.auth.user,
              pass: mailConfig.auth.pass,
            },
          },
          defaults: {
            from: `"${mailConfig.senderName}" <${mailConfig.sender}>`,
          },
          template: {
            dir: templatePagesDir,
            adapter: new HandlebarsAdapter(helpers(config)),
            options: {
              strict: true,
            },
          },
          options: {
            partials: {
              dir: templatePartialsDir,
              options: {
                strict: true,
              },
            },
          },
        };
      },
    });

    return {
      imports: [module],
      module: MailSenderModule,
      global,
      providers: [MailSenderService],
      exports: [MailSenderService],
    };
  }
}
