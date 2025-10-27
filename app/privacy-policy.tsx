// privacy-policy.tsx - dummy content
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Colors, Spacing, FontSizes } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function PrivacyPolicyScreen() {
  const { t } = useApp();

  return (
    <>
      <Stack.Screen 
        options={{
          title: t('account.privacyPolicy'),
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.text.primary,
          headerShadowVisible: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('privacyPolicy.title')}</Text>
          <Text style={styles.updateDate}>{t('privacyPolicy.lastUpdated')}</Text>

          <Text style={styles.paragraph}>
            {t('privacyPolicy.intro')}
          </Text>

          <Text style={styles.paragraph}>
            {t('privacyPolicy.personalInfo')}
          </Text>

          <Text style={styles.sectionTitle}>{t('privacyPolicy.infoWeCollect')}</Text>
          <Text style={styles.paragraph}>
            {t('privacyPolicy.infoWeCollectDesc')}
          </Text>

          <Text style={styles.subSectionTitle}>Information You Provide to Us</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Registration Information.</Text> If you sign up for an account, register to use our Services, or sign up for emails or other updates, we may ask you for basic contact information, such as your name, email address, phone number, and/or mailing address. We may also collect certain demographic information when you register for our Services, including your age, gender, personal interests, income, and/or marital status.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Communications.</Text> If you contact us directly, we may collect additional information from you. For example, when you reach out to our customer support team, we may ask for your name, email address, mailing address, phone number, or other contact information so that we can verify your identity and communicate with you. We may also store the contents of any message or attachments that you send to us, as well as any information you submit through any of our forms or questionnaires.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Events.</Text> If you register for an event that we host, whether in-person or online, we may collect relevant information such as your name, address, title, company, phone number, or email address, as well as specific information relevant to the event for which you are registering.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>User Content.</Text> We may allow you and other Users of our Services to share their own content with others. This may include posts, comments, reviews, or other User-generated content. Unless otherwise noted when creating such content, this information may be shared publicly through our Services.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Payment Information.</Text> If you make a purchase through our Services, we (or a third-party payment processor acting on our behalf) may collect your payment-related information, such as credit card or other financial information.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Job Applications.</Text> If you apply for a job with us, we may collect relevant information such as your name, phone number, email address, position, job history, education history, references, a cover letter, and other similar information.
          </Text>

          <Text style={styles.subSectionTitle}>Information We Collect Automatically When You Use Our Services</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Device Information.</Text> We may collect information about the devices and software you use to access our Services, such as your IP address, web browser type, operating system version, device identifiers, and other similar information.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Usage Information.</Text> To help us understand how you use our Services and to help us improve them, we may collect data about your interactions with our Services. This includes, but is not limited to, information such as crash reports, session lengths and times, the specific pages and other content you view, and any searches you conduct on our site.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Cookies and Similar Technologies.</Text> We and our third-party partners may collect information using cookies, pixel tags, or similar technologies. Cookies are small text files containing a string of alphanumeric characters. We may use both session cookies and persistent cookies. A session cookie disappears after you close your browser. A persistent cookie remains after you close your browser and may be used by your browser on subsequent visits to our Services.
          </Text>

          <Text style={styles.subSectionTitle}>Information We Receive from Other Sources</Text>
          <Text style={styles.paragraph}>
            We may receive information about you from other sources, including third parties that help us update, expand, and analyze our records, identify new customers, or detect or prevent fraud. What information we receive from third parties is governed by the privacy settings, policies, and/or procedures of the relevant organizations, and we encourage you to review them.
          </Text>

          <Text style={styles.sectionTitle}>How We Use the Information We Collect</Text>
          <Text style={styles.paragraph}>We may use the information we collect:</Text>
          <Text style={styles.bulletPoint}>• To provide, maintain, improve, and enhance our Services;</Text>
          <Text style={styles.bulletPoint}>• To understand and analyze how you use our Services and develop new products, services, features, and functionality;</Text>
          <Text style={styles.bulletPoint}>• To facilitate purchases of products or services that you order;</Text>
          <Text style={styles.bulletPoint}>• To host events;</Text>
          <Text style={styles.bulletPoint}>• To allow you to share content with other Users of our Services;</Text>
          <Text style={styles.bulletPoint}>• To evaluate and process applications for jobs with us;</Text>
          <Text style={styles.bulletPoint}>• To communicate with you, provide you with updates and other information relating to our Services, provide information that you request, respond to comments and questions, and otherwise provide User support;</Text>
          <Text style={styles.bulletPoint}>• For marketing and advertising purposes, including developing and providing promotional and advertising materials that may be relevant, valuable or otherwise of interest to you;</Text>
          <Text style={styles.bulletPoint}>• To detect and prevent fraud, and respond to trust and safety issues that may arise;</Text>
          <Text style={styles.bulletPoint}>• In connection with generative AI applications;</Text>
          <Text style={styles.bulletPoint}>• For compliance purposes, including enforcing our Terms of Use or other legal rights, or as may be required by applicable laws and regulations or requested by any judicial process or governmental agency;</Text>
          <Text style={styles.bulletPoint}>• For other purposes for which we provide specific notice at the time the information is collected.</Text>

          <Text style={styles.sectionTitle}>How We Share the Information We Collect</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Service Providers.</Text> We may share any information we collect with service providers retained in connection with the provision of our Services. These companies are permitted to use this information to help us provide our Services to improve the services they provide us, and for other purposes disclosed in this Privacy Notice.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Our Affiliates and Representatives.</Text> We may share your information with our affiliates, subsidiaries, and representatives as needed to provide our Services.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Other Users.</Text> Content you post on our websites, including comments, may be displayed to other Users as appropriate.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Our Advertising and Analytics Partners.</Text> We work with our Service Providers and other analytics and/or advertising partners to collect and process certain analytics data regarding your use of our Services and to conduct advertising via cookies, as detailed below. Our Service Providers and other analytics and/or advertising partners may also collect information about your use of other websites, apps, and online resources. Parties that may process your information for advertising and analytics purposes include our Service Providers and may also include:
          </Text>

          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Google</Text> - We may use Google's services to collect and process analytics data about how our Users interact with our Services and to place ads that we think may interest Users and potential users. For more information, see Google's Privacy & Terms page.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Meta</Text> - We may use Meta's services to place ads that we think may interest our users and potential users across Meta's various websites, such as Facebook and Instagram. For more information, see Meta's Data Policy and Privacy Center.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>LinkedIn</Text> - We may use LinkedIn's services to place ads that we think may interest our users and potential users, as well as to advertise openings to potential employees. For more information, see LinkedIn's Privacy Policy and Cookie Policy.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Microsoft</Text> - We may use Microsoft's services to place ads that we think may interest our users and potential users. For more information, see Microsoft's Advertising Policies.</Text>

          <Text style={styles.paragraph}>
            Please note that our Service Providers and advertising and analytics partners may change from time to time. If you would like a current list of the specific parties we are working with to provide analytics and/or advertising services, contact us at support@sab-store.com. For details about your choices regarding how these partners use your information, see the Your Choices section below.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>As Required by Law and Similar Disclosures.</Text> We may access, preserve, and disclose your information if we believe doing so is required or appropriate to: (a) comply with law enforcement requests and legal process, such as a court order or subpoena; (b) respond to your requests; or (c) protect your, our, or others' rights, property, or safety. In particular, we may disclose relevant information to the appropriate third parties if you post any illegal, threatening, or objectionable content on or through the Services.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Events.</Text> We may share your information with event partners or co-sponsors to facilitate the events for which you register.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Merger, Sale, or Other Asset Transfers.</Text> We may transfer your information to service providers, advisors, potential transactional partners, or other third parties in connection with the consideration, negotiation, or completion of a corporate transaction in which we are acquired by or merged with another company or in which we sell, liquidate, or transfer all or a portion of our assets. The use of your information following any of these events will be governed by the same general provisions of this Privacy Notice.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Consent.</Text> We may also disclose your information with your permission.
          </Text>

          <Text style={styles.sectionTitle}>Your Choices</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Our Communications.</Text> From time to time, you may receive marketing or other informational email messages from us. You can unsubscribe from our promotional and informational emails via the link provided in the emails. After opting out of receiving such messages from us, users may continue to receive administrative messages from us that are necessary to service User accounts.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Cookies.</Text> Most web browsers allow you to manage cookies through the browser settings. To find out more about cookies, you can visit www.aboutcookies.org or www.allaboutcookies.org.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Our Partners.</Text> You can learn more about Google's privacy practices and your options for how they use your information on Google's website. You can also install the Google Analytics Opt-out Browser Add-on. Meta, the parent company of Facebook, provides information about how it uses the information it collects through our Services in its Data Policy. You can also learn specifically about Facebook's advertising practices on its website.
          </Text>

          <Text style={styles.paragraph}>
            Some of our advertising partners may be members of the Network Advertising Initiative or the Digital Advertising Alliance. You can visit those organizations' websites to learn about how you may opt out of receiving web-based personalized ads from their member companies. You can also access any settings offered by your mobile operating system to limit ad tracking. To inquire about your choices regarding our business partners generally, contact us at support@sab-store.com.
          </Text>

          <Text style={styles.sectionTitle}>Third-Party Content</Text>
          <Text style={styles.paragraph}>
            Our Services may contain links to other websites, products, or services that we do not own or operate. We are not responsible for the content provided by, or the privacy practices of, these third parties. Please be aware that this Privacy Notice does not apply to your activities on these third-party services or any information you disclose to these third parties. We encourage you to read their privacy policies before providing any information to them.
          </Text>

          <Text style={styles.sectionTitle}>{t('privacyPolicy.security')}</Text>
          <Text style={styles.paragraph}>
            {t('privacyPolicy.securityDesc')}
          </Text>

          <Text style={styles.sectionTitle}>{t('privacyPolicy.childrenPrivacy')}</Text>
          <Text style={styles.paragraph}>
            {t('privacyPolicy.childrenPrivacyDesc')}
          </Text>

          <Text style={styles.sectionTitle}>International Visitors</Text>
          <Text style={styles.paragraph}>
            Our Services are hosted in the United States and intended for use by individuals located within the United States. If you choose to use the Services from the European Union or other regions of the world with laws governing data collection and use that may differ from U.S. law, please note that you are transferring your information outside of those regions to the United States for storage and processing. Also, we may transfer your data from the U.S. to other countries or regions in connection with operating the Services and storing or processing data. By using our Services, you consent to the transfer, storage, and processing of your information as described in this Privacy Notice.
          </Text>

          <Text style={styles.sectionTitle}>Changes to this Privacy Notice</Text>
          <Text style={styles.paragraph}>
            We will post any adjustments to the Privacy Notice on this page, and the revised version will be effective when it is posted. If we make material changes, we may notify you via a notice posted on our website or another method. We encourage you to read this Privacy Notice periodically to stay up to date about our privacy practices.
          </Text>

          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            All feedback, comments, requests for technical support, and other communications relating to the Sites and our data collection and processing activities should be directed to: support@sab-store.com.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('privacyPolicy.footer')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  updateDate: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  subSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.6,
    marginBottom: Spacing.md,
  },
  bold: {
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  bulletPoint: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: FontSizes.md * 1.6,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
});
