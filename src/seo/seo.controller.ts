import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { AdminGuard } from './guards/admin.guard';
import { SeoDraft } from './dto/seo-response.dto';

@Controller('api/seo')
@UseGuards(AdminGuard)
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'Safe AI SEO Helper API',
      version: '1.0.0',
      activeProvider: 'mock-llm-provider-v1',
      safetyModules: {
        piiSanitizer: 'ENABLED',
        accuracyGuard: 'ENABLED',
        humanInTheLoopApproval: 'ENFORCED',
      },
    };
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(@Body() dto: GenerateSeoDto, @Req() req: any): Promise<SeoDraft> {
    const actor = req.user?.name || 'Space42 Admin';
    return this.seoService.generate(dto, actor);
  }

  @Get('drafts')
  async getAllDrafts(): Promise<SeoDraft[]> {
    return this.seoService.getAllDrafts();
  }

  @Get('draft/:id')
  async getDraft(@Param('id') id: string): Promise<SeoDraft> {
    return this.seoService.getDraft(id);
  }

  @Put('draft/:id')
  async updateDraft(
    @Param('id') id: string,
    @Body() dto: UpdateDraftDto,
    @Req() req: any,
  ): Promise<SeoDraft> {
    const actor = req.user?.name || 'Space42 Admin';
    return this.seoService.updateDraft(id, dto, actor);
  }

  @Post('draft/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveDraft(@Param('id') id: string, @Req() req: any): Promise<SeoDraft> {
    const actor = req.user?.name || 'Space42 Admin';
    return this.seoService.approveDraft(id, actor);
  }

  @Post('draft/:id/publish')
  @HttpCode(HttpStatus.OK)
  async publishDraft(@Param('id') id: string, @Req() req: any): Promise<SeoDraft> {
    const actor = req.user?.name || 'Space42 Admin';
    return this.seoService.publishDraft(id, actor);
  }

  @Post('draft/:id/regenerate')
  @HttpCode(HttpStatus.OK)
  async regenerateDraft(@Param('id') id: string, @Req() req: any): Promise<SeoDraft> {
    const actor = req.user?.name || 'Space42 Admin';
    return this.seoService.regenerateDraft(id, actor);
  }
}
